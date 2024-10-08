-- name: GetParticipatingTeam :one
SELECT * FROM participant_teams
WHERE id = $1
LIMIT 1;

-- name: GetAllParticipatingTeams :many
SELECT * FROM participant_teams
ORDER BY id;

-- name: GetTeamPlayers :many
SELECT 
    pt.name AS ipl_team_name,
    pt.balance AS team_balance,
    p.*
FROM participant_teams pt
INNER JOIN players p ON p.team_id = pt.id
WHERE pt.id = $1
ORDER BY p.id;

-- name: GetUserTeamPlayers :many
SELECT 
    (
      SELECT pt.name 
     FROM participant_teams pt 
     JOIN users u ON u.participant_team_id = pt.id 
     WHERE u.id = $1
    ) AS ipl_team_name,
    pt.balance AS team_balance,
    p.*
FROM players p
JOIN participant_teams pt ON p.team_id = pt.id
JOIN users u ON u.participant_team_id = pt.id
WHERE u.id = $1;

-- name: GetAllTeamPlayers :many
SELECT 
    pt.id AS team_id,
    pt.name AS ipl_team_name,
    pt.balance AS team_balance,
    p.*
FROM participant_teams pt
LEFT JOIN players p ON p.team_id = pt.id
ORDER BY pt.id, p.id;
