/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *     AuthRequest:
 *       type: object
 *       required: [username, password]
 *       properties:
 *         username:
 *           type: string
 *         password:
 *           type: string
 *     RegisterRequest:
 *       type: object
 *       required: [username, password, email]
 *       properties:
 *         username:
 *           type: string
 *         password:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *     AuthResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *         user:
 *           type: object
 *           additionalProperties: true
 *     MessageResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *     IsMusicResponse:
 *       type: object
 *       properties:
 *         is_music:
 *           type: boolean
 *         prediction:
 *           type: number
 *         version:
 *           type: string
 *     NEREntity:
 *       type: object
 *       required: [NER, text, start, end]
 *       properties:
 *         NER:
 *           type: string
 *         text:
 *           type: string
 *         start:
 *           type: integer
 *           minimum: 0
 *         end:
 *           type: integer
 *           minimum: 0
 *     NERResponse:
 *       type: object
 *       properties:
 *         prediction:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/NEREntity'
 *         version:
 *           type: string
 *     IsMusicReviewRequest:
 *       type: object
 *       required: [watchID, is_music]
 *       properties:
 *         watchID:
 *           type: string
 *         is_music:
 *           type: boolean
 *     DeleteIsMusicReviewRequest:
 *       type: object
 *       required: [watchID]
 *       properties:
 *         watchID:
 *           type: string
 *     NERReviewRequest:
 *       type: object
 *       required: [watchID, language, namedEntities]
 *       properties:
 *         watchID:
 *           type: string
 *         language:
 *           type: string
 *         namedEntities:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/NEREntity'
 *     DeleteNERReviewRequest:
 *       type: object
 *       required: [watchID]
 *       properties:
 *         watchID:
 *           type: string
 *     GenreReviewRequest:
 *       type: object
 *       required: [watchID, genres]
 *       properties:
 *         watchID:
 *           type: string
 *         genres:
 *           type: array
 *           items:
 *             type: string
 *     DeleteGenreReviewRequest:
 *       type: object
 *       required: [watchID]
 *       properties:
 *         watchID:
 *           type: string
 *     UpdateUserRequest:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         displayName:
 *           type: string
 *         handle:
 *           type: string
 *         currentPassword:
 *           type: string
 *         newPassword:
 *           type: string
 * paths:
 *   /ai/is-music:
 *     get:
 *       tags: [AI]
 *       summary: Predict whether a video is music
 *       parameters:
 *         - in: query
 *           name: watchID
 *           required: true
 *           schema:
 *             type: string
 *       responses:
 *         '200':
 *           description: Prediction result
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/IsMusicResponse'
 *   /ai/ner:
 *     get:
 *       tags: [AI]
 *       summary: Extract named entities for a video
 *       parameters:
 *         - in: query
 *           name: watchID
 *           required: true
 *           schema:
 *             type: string
 *       responses:
 *         '200':
 *           description: NER prediction
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/NERResponse'
 *   /auth:
 *     post:
 *       tags: [Auth]
 *       summary: Authenticate a user
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthRequest'
 *       responses:
 *         '200':
 *           description: Authenticated
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/AuthResponse'
 *   /register:
 *     post:
 *       tags: [Auth]
 *       summary: Register a new user
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegisterRequest'
 *       responses:
 *         '201':
 *           description: User created
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/MessageResponse'
 *   /review/music:
 *     post:
 *       tags: [Reviews]
 *       summary: Submit is-music review
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/IsMusicReviewRequest'
 *       responses:
 *         '200':
 *           description: Review saved
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/MessageResponse'
 *     delete:
 *       tags: [Reviews]
 *       summary: Remove is-music review
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeleteIsMusicReviewRequest'
 *       responses:
 *         '200':
 *           description: Review removed
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/MessageResponse'
 *   /review/ner:
 *     post:
 *       tags: [Reviews]
 *       summary: Submit NER review
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NERReviewRequest'
 *       responses:
 *         '200':
 *           description: Review saved
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/MessageResponse'
 *     delete:
 *       tags: [Reviews]
 *       summary: Remove NER review
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeleteNERReviewRequest'
 *       responses:
 *         '200':
 *           description: Review removed
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/MessageResponse'
 *   /review/genre:
 *     post:
 *       tags: [Reviews]
 *       summary: Submit genre review
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GenreReviewRequest'
 *       responses:
 *         '200':
 *           description: Review saved
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/MessageResponse'
 *     delete:
 *       tags: [Reviews]
 *       summary: Remove genre review
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeleteGenreReviewRequest'
 *       responses:
 *         '200':
 *           description: Review removed
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/MessageResponse'
 *   /user/{handle}/top:
 *     get:
 *       tags: [Users]
 *       summary: Get top items for a user
 *       parameters:
 *         - in: path
 *           name: handle
 *           required: true
 *           schema:
 *             type: string
 *         - in: query
 *           name: type
 *           required: true
 *           schema:
 *             type: string
 *             enum: [music, artist, genre]
 *         - in: query
 *           name: startDate
 *           schema:
 *             type: string
 *             format: date-time
 *         - in: query
 *           name: endDate
 *           schema:
 *             type: string
 *             format: date-time
 *         - in: query
 *           name: limit
 *           schema:
 *             type: integer
 *             minimum: 1
 *             maximum: 100
 *             default: 20
 *         - in: query
 *           name: offset
 *           schema:
 *             type: integer
 *             minimum: 0
 *             default: 0
 *       responses:
 *         '200':
 *           description: Top items
 *   /user/{handle}:
 *     get:
 *       tags: [Users]
 *       summary: Get user profile
 *       parameters:
 *         - in: path
 *           name: handle
 *           required: true
 *           schema:
 *             type: string
 *       responses:
 *         '200':
 *           description: User profile
 *     put:
 *       tags: [Users]
 *       summary: Update own user profile
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: handle
 *           required: true
 *           schema:
 *             type: string
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UpdateUserRequest'
 *       responses:
 *         '200':
 *           description: Profile updated
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/MessageResponse'
 *         '403':
 *           description: Forbidden
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ErrorResponse'
 *     delete:
 *       tags: [Users]
 *       summary: Delete own account
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: handle
 *           required: true
 *           schema:
 *             type: string
 *       responses:
 *         '200':
 *           description: Account deleted
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/MessageResponse'
 *         '403':
 *           description: Forbidden
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ErrorResponse'
 *   /user/{handle}/history:
 *     get:
 *       tags: [Users]
 *       summary: Get user history
 *       parameters:
 *         - in: path
 *           name: handle
 *           required: true
 *           schema:
 *             type: string
 *         - in: query
 *           name: limit
 *           schema:
 *             type: integer
 *             minimum: 1
 *             maximum: 100
 *             default: 20
 *         - in: query
 *           name: offset
 *           schema:
 *             type: integer
 *             minimum: 0
 *             default: 0
 *       responses:
 *         '200':
 *           description: User history
 *   /user/{handle}/stats:
 *     get:
 *       tags: [Users]
 *       summary: Get aggregate user stats
 *       parameters:
 *         - in: path
 *           name: handle
 *           required: true
 *           schema:
 *             type: string
 *         - in: query
 *           name: startDate
 *           schema:
 *             type: string
 *             format: date-time
 *         - in: query
 *           name: endDate
 *           schema:
 *             type: string
 *             format: date-time
 *       responses:
 *         '200':
 *           description: User stats
 *   /videos:
 *     get:
 *       tags: [Videos]
 *       summary: List videos
 *       parameters:
 *         - in: query
 *           name: limit
 *           schema:
 *             type: integer
 *             default: 10
 *         - in: query
 *           name: page
 *           schema:
 *             type: integer
 *             default: 0
 *         - in: query
 *           name: sortBy
 *           schema:
 *             type: string
 *             enum: [alphabetical, duration, date, random]
 *             default: alphabetical
 *         - in: query
 *           name: reverse
 *           schema:
 *             type: boolean
 *             default: false
 *         - in: query
 *           name: verified
 *           schema:
 *             type: boolean
 *         - in: query
 *           name: music
 *           schema:
 *             type: boolean
 *         - in: query
 *           name: hasNER
 *           schema:
 *             type: boolean
 *       responses:
 *         '200':
 *           description: Video list
 *   /youtube/artist-channel:
 *     get:
 *       tags: [YouTube]
 *       summary: Fetch artist channel details
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: query
 *           name: channelId
 *           required: true
 *           schema:
 *             type: string
 *       responses:
 *         '200':
 *           description: Channel details
 *   /stats:
 *     get:
 *       tags: [System]
 *       summary: Get server statistics
 *       responses:
 *         '200':
 *           description: Server stats
 */

export {};
