# Backend Integration Notes

## Frontend contract discovered
- Meal shape: `id,name,score,category,types[],ingredients[],steps[],link,nutritionalValue,image,aiCategorized,aiNutrition,prepTime,cookTime,servings,tags,createdAt`
- Week plan shape: `id,startDate,days[{date,breakfast,lunch,snack,proteinShake,dinner}],aiGenerated`
- Grocery list shape: `id,weekPlanId,weekStartDate,generatedAt,items[]` with `checked`, `urgency`, `forMeals`
- Date format used by frontend: `yyyy-MM-dd`
- IDs are strings and frontend expects ISO timestamps for created/generated dates.

## API routes (implemented)
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `GET /meals?search=&type=`
- `GET /meals/:id`
- `POST /meals`
- `PATCH /meals/:id`
- `DELETE /meals/:id`
- `GET /planner/week/:weekStartDate`
- `POST /planner/week/:weekStartDate/slot`
- `POST /planner/week/:weekStartDate/ai-generate`
- `GET /groceries/:weekStartDate`
- `POST /groceries/:weekStartDate/generate`
- `PATCH /groceries/:listId/items/:itemId/toggle`

## Minimal frontend changes required
1. Add `VITE_API_URL=http://localhost:4000` to frontend `.env`.
2. Replace `AppContext` mock mutations with API calls in a thin `src/app/api/client.ts` layer.
3. Keep frontend interfaces as-is; backend responses are already shaped to current types.
4. Add auth storage for `accessToken` + `refreshToken` and inject `Authorization: Bearer <accessToken>`.
5. Use refresh flow on `401` before forcing logout.

## Security and production controls
- JWT access + refresh token flow

## Supabase image storage

Meal image uploads now use Supabase Storage instead of Railway's local filesystem.

Required backend variables:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_IMAGES_BUCKET=images
```

`SUPABASE_SERVICE_ROLE_KEY` is server-only. Never expose it to the frontend, a `VITE_` variable, or Cloudflare Pages.
- Helmet + CORS
- ValidationPipe with whitelist
- Global exception filter
- Prisma indexes for query-heavy paths
- Use Redis rate limiting + cache interceptor in next iteration
- Add BullMQ for AI planning and grocery generation jobs if latency grows

## Run locally
```bash
cd backend
cp .env.example .env
docker compose up -d db
npm install
npx prisma migrate dev
npm run start:dev
```

Swagger: `http://localhost:4000/docs`
