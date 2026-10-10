// Lua scripts. Each runs atomically inside Redis (one EVAL = one round trip).

/**
 * Answer submission.
 * KEYS: 1 state, 2 players, 3 cumulative zset
 * ARGV: 1 pid, 2 choice (shuffled index), 3 server receive ms, 4 grace ms, 5 min pts, 6 max pts, 7 question index
 * Returns a status string. NEVER returns correctness or points (those stay hidden until REVEAL).
 */
export const LUA_ANSWER = `
local st = redis.call('HMGET', KEYS[1], 'phase','qi','startAt','endAt','paused','ci','limit')
if st[1] ~= 'QUESTION' then return 'CLOSED' end
if st[2] ~= ARGV[7] then return 'STALE' end
if st[5] == '1' then return 'PAUSED' end
local now = tonumber(ARGV[3])
local startAt = tonumber(st[3])
local endAt = tonumber(st[4])
if now < startAt then return 'EARLY' end
if now > endAt + tonumber(ARGV[4]) then return 'LATE' end
if redis.call('HEXISTS', KEYS[2], ARGV[1]) == 0 then return 'NOPLAYER' end
local limitMs = tonumber(st[7]) * 1000
local remaining = endAt - now
if remaining < 0 then remaining = 0 end
if remaining > limitMs then remaining = limitMs end
local elapsed = now - startAt
if elapsed < 0 then elapsed = 0 end
if elapsed > limitMs + tonumber(ARGV[4]) then elapsed = limitMs + tonumber(ARGV[4]) end
local choice = tonumber(ARGV[2])
local correct = (choice == tonumber(st[6]))
local pts = 0
if correct then
  local mn = tonumber(ARGV[5])
  local mx = tonumber(ARGV[6])
  pts = math.floor(mn + (mx - mn) * (remaining / limitMs) + 0.5)
else
  pts = -50
end
local q = st[2]
local rec = string.format('%d|%d|%d', choice, pts, elapsed)
if redis.call('HSETNX', 'a:' .. q, ARGV[1], rec) == 0 then return 'DUP' end
redis.call('HINCRBY', 'd:' .. q, tostring(choice), 1)
local delta = pts * 1000000 - elapsed
redis.call('ZADD', 'zq:' .. q, delta, ARGV[1])
redis.call('ZINCRBY', KEYS[3], delta, ARGV[1])
return 'OK'
`;

/**
 * Compare-and-set on the game state hash.
 * KEYS: 1 state ; ARGV: 1 expected version, then field,value pairs
 */
export const LUA_CAS = `
local v = redis.call('HGET', KEYS[1], 'v')
if v ~= ARGV[1] then return 0 end
for i = 2, #ARGV, 2 do redis.call('HSET', KEYS[1], ARGV[i], ARGV[i+1]) end
redis.call('HSET', KEYS[1], 'v', tostring(tonumber(v) + 1))
return 1
`;

/**
 * Public state + counters in one command.
 * KEYS: 1 state, 2 players
 */
export const LUA_PUBLIC = `
local s = redis.call('HGETALL', KEYS[1])
local n = redis.call('HLEN', KEYS[2])
local qi = redis.call('HGET', KEYS[1], 'qi')
local a = 0
if qi and tonumber(qi) >= 0 then a = redis.call('HLEN', 'a:' .. qi) end
return cjson.encode({s = s, n = n, a = a})
`;

/**
 * A player's own result. Refuses until the question is in REVEAL/FINAL.
 * KEYS: 1 state, 2 cumulative zset ; ARGV: 1 pid, 2 question index
 */
export const LUA_ME = `
local st = redis.call('HMGET', KEYS[1], 'phase', 'qi')
if (st[1] ~= 'REVEAL' and st[1] ~= 'FINAL') or st[2] ~= ARGV[2] then return cjson.encode({s='NOTYET'}) end
local score = redis.call('ZSCORE', KEYS[2], ARGV[1])
if not score then return cjson.encode({s='NOPLAYER'}) end
local rec = redis.call('HGET', 'a:' .. ARGV[2], ARGV[1])
local rank = redis.call('ZREVRANK', KEYS[2], ARGV[1])
local total = redis.call('ZCARD', KEYS[2])
local above = false
if rank > 0 then
  local r = redis.call('ZREVRANGE', KEYS[2], rank - 1, rank - 1, 'WITHSCORES')
  above = r[2]
end
return cjson.encode({s='OK', rec = rec or false, score = score, rank = rank, total = total, above = above})
`;
