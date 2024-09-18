-- name: CreateOrUpdateUser :one
INSERT INTO users (
  id, email, name, given_name, family_name, picture
) VALUES (
  $1, $2, $3, $4, $5, $6
) 
ON CONFLICT (id) DO UPDATE
SET email = $2, name = $3, given_name = $4, family_name = $5, picture = $6
RETURNING * ;

-- name: GetUser :one
SELECT * FROM users 
WHERE id = $1
LIMIT 1;
