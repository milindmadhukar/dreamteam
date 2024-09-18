// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.27.0

package db

import (
	"database/sql"
)

type ParticipantTeam struct {
	ID      int32  `json:"id"`
	Name    string `json:"name"`
	Balance int32  `json:"balance"`
}

type Player struct {
	ID        int32          `json:"id"`
	Name      string         `json:"name"`
	Country   string         `json:"country"`
	Role      string         `json:"role"`
	Rating    int32          `json:"rating"`
	BasePrice int32          `json:"basePrice"`
	AvatarUrl sql.NullString `json:"avatarUrl"`
	TeamID    sql.NullInt32  `json:"teamId"`
	IplTeam   sql.NullInt64  `json:"iplTeam"`
}
