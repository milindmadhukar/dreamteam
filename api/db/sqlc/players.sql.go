// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.27.0
// source: players.sql

package db

import (
	"context"
	"database/sql"
)

const assignTeamToPlayer = `-- name: AssignTeamToPlayer :exec
WITH player_update AS (
    UPDATE players
    SET team_id = $1, sold_for_amount = $2
    WHERE players.id = $3
    RETURNING 1
)
UPDATE participant_teams
SET balance = balance - $2
WHERE participant_teams.id = $1
    AND EXISTS (SELECT 1 FROM player_update)
`

type AssignTeamToPlayerParams struct {
	ID      int32 `json:"id"`
	Balance int32 `json:"balance"`
	ID_2    int32 `json:"id2"`
}

func (q *Queries) AssignTeamToPlayer(ctx context.Context, arg AssignTeamToPlayerParams) error {
	_, err := q.db.ExecContext(ctx, assignTeamToPlayer, arg.ID, arg.Balance, arg.ID_2)
	return err
}

const getAllPlayers = `-- name: GetAllPlayers :many
SELECT 
    players.id,
    players.name,
    players.country,
    players.role,
    players.rating,
    players.base_price,
    players.avatar_url,
    players.team_id,
    players.ipl_team,
    participant_teams.name AS ipl_team_name
FROM 
    players
LEFT JOIN 
    participant_teams ON players.ipl_team = participant_teams.id
ORDER BY 
    players.id
LIMIT $1 OFFSET $2
`

type GetAllPlayersParams struct {
	Limit  int32 `json:"limit"`
	Offset int32 `json:"offset"`
}

type GetAllPlayersRow struct {
	ID          int32          `json:"id"`
	Name        string         `json:"name"`
	Country     string         `json:"country"`
	Role        string         `json:"role"`
	Rating      int32          `json:"rating"`
	BasePrice   int32          `json:"basePrice"`
	AvatarUrl   sql.NullString `json:"avatarUrl"`
	TeamID      sql.NullInt32  `json:"teamId"`
	IplTeam     sql.NullInt64  `json:"iplTeam"`
	IplTeamName sql.NullString `json:"iplTeamName"`
}

func (q *Queries) GetAllPlayers(ctx context.Context, arg GetAllPlayersParams) ([]GetAllPlayersRow, error) {
	rows, err := q.db.QueryContext(ctx, getAllPlayers, arg.Limit, arg.Offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []GetAllPlayersRow
	for rows.Next() {
		var i GetAllPlayersRow
		if err := rows.Scan(
			&i.ID,
			&i.Name,
			&i.Country,
			&i.Role,
			&i.Rating,
			&i.BasePrice,
			&i.AvatarUrl,
			&i.TeamID,
			&i.IplTeam,
			&i.IplTeamName,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const getPlayer = `-- name: GetPlayer :one
SELECT 
    players.id,
    players.name,
    players.country,
    players.role,
    players.rating,
    players.base_price,
    players.avatar_url,
    players.team_id,
    participant_teams.name AS ipl_team_name
FROM 
    players
LEFT JOIN 
    participant_teams ON players.ipl_team = participant_teams.id
WHERE players.id = $1
LIMIT 1
`

type GetPlayerRow struct {
	ID          int32          `json:"id"`
	Name        string         `json:"name"`
	Country     string         `json:"country"`
	Role        string         `json:"role"`
	Rating      int32          `json:"rating"`
	BasePrice   int32          `json:"basePrice"`
	AvatarUrl   sql.NullString `json:"avatarUrl"`
	TeamID      sql.NullInt32  `json:"teamId"`
	IplTeamName sql.NullString `json:"iplTeamName"`
}

func (q *Queries) GetPlayer(ctx context.Context, id int32) (GetPlayerRow, error) {
	row := q.db.QueryRowContext(ctx, getPlayer, id)
	var i GetPlayerRow
	err := row.Scan(
		&i.ID,
		&i.Name,
		&i.Country,
		&i.Role,
		&i.Rating,
		&i.BasePrice,
		&i.AvatarUrl,
		&i.TeamID,
		&i.IplTeamName,
	)
	return i, err
}

const getRandomAvailablePlayer = `-- name: GetRandomAvailablePlayer :one
SELECT 
    players.id,
    players.name,
    players.country,
    players.role,
    players.rating,
    players.base_price,
    players.avatar_url,
    players.team_id,
    participant_teams.name AS ipl_team_name
FROM 
    players
LEFT JOIN 
    participant_teams ON players.ipl_team = participant_teams.id
WHERE 
    players.team_id IS NULL
    AND players.is_unsold = FALSE
ORDER BY 
    RANDOM()
LIMIT 1
`

type GetRandomAvailablePlayerRow struct {
	ID          int32          `json:"id"`
	Name        string         `json:"name"`
	Country     string         `json:"country"`
	Role        string         `json:"role"`
	Rating      int32          `json:"rating"`
	BasePrice   int32          `json:"basePrice"`
	AvatarUrl   sql.NullString `json:"avatarUrl"`
	TeamID      sql.NullInt32  `json:"teamId"`
	IplTeamName sql.NullString `json:"iplTeamName"`
}

func (q *Queries) GetRandomAvailablePlayer(ctx context.Context) (GetRandomAvailablePlayerRow, error) {
	row := q.db.QueryRowContext(ctx, getRandomAvailablePlayer)
	var i GetRandomAvailablePlayerRow
	err := row.Scan(
		&i.ID,
		&i.Name,
		&i.Country,
		&i.Role,
		&i.Rating,
		&i.BasePrice,
		&i.AvatarUrl,
		&i.TeamID,
		&i.IplTeamName,
	)
	return i, err
}
