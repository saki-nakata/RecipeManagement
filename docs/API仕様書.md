# API仕様書

**バージョン:** 1.0
**作成日:** 2026-05-09
**関連ドキュメント:** [要件定義書.md](要件定義書.md) | [バリデーション仕様書.md](バリデーション仕様書.md)

---

## 共通仕様

| 項目 | 内容 |
|------|------|
| ベース URL | `http://localhost:3000`（開発）/ `http://[EC2-IP]:3000`（本番） |
| リクエスト形式 | JSON（`Content-Type: application/json`）※ 画像アップロードは multipart/form-data |
| レスポンス形式 | JSON |
| 文字コード | UTF-8 |

### 共通エラーレスポンス

| ステータスコード | 意味 | レスポンス例 |
|---------------|------|------------|
| 400 | バリデーションエラー | `{ "error": "レシピ名は必須です" }` |
| 404 | リソースが見つからない | `{ "error": "レシピが見つかりません" }` |
| 500 | サーバー内部エラー | `{ "error": "Internal Server Error" }` |

---

## エンドポイント一覧

| Method | エンドポイント | 機能 |
|--------|--------------|------|
| GET | `/api/recipes` | レシピ一覧取得（検索・フィルタ対応） |
| POST | `/api/recipes` | レシピ作成 |
| GET | `/api/recipes/[id]` | レシピ1件取得 |
| PUT | `/api/recipes/[id]` | レシピ更新 |
| DELETE | `/api/recipes/[id]` | レシピ削除 |
| PATCH | `/api/recipes/[id]/favorite` | お気に入りトグル |
| GET | `/api/categories` | カテゴリ一覧取得 |
| POST | `/api/upload` | 画像アップロード |

---

## GET /api/recipes

**機能:** レシピ一覧を取得する。クエリパラメータで検索・フィルタが可能。

### クエリパラメータ

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| q | string | × | レシピ名・説明文への部分一致キーワード |
| categoryId | number | × | カテゴリ ID で絞り込み |
| favorite | boolean | × | `true` のときお気に入りのみ |

### リクエスト例

```
GET /api/recipes?q=鶏&categoryId=4&favorite=true
```

### レスポンス（200 OK）

```json
[
  {
    "id": 1,
    "title": "鶏の唐揚げ",
    "description": "サクサクジューシーな唐揚げ",
    "ingredients": "鶏もも肉 300g\n醤油 大さじ2",
    "instructions": "鶏肉を切る\n漬けダレに漬ける",
    "servings": 2,
    "cookTime": 30,
    "imagePath": "/uploads/1715123456789.jpg",
    "isFavorite": true,
    "categoryId": 4,
    "category": {
      "id": 4,
      "name": "肉類",
      "icon": "🥩"
    },
    "createdAt": "2026-05-09T10:00:00.000Z",
    "updatedAt": "2026-05-09T10:00:00.000Z"
  }
]
```

---

## POST /api/recipes

**機能:** 新しいレシピを作成する。

### リクエストボディ

```json
{
  "title": "鶏の唐揚げ",
  "description": "サクサクジューシーな唐揚げ",
  "ingredients": "鶏もも肉 300g\n醤油 大さじ2",
  "instructions": "鶏肉を切る\n漬けダレに漬ける",
  "servings": 2,
  "cookTime": 30,
  "imagePath": "/uploads/1715123456789.jpg",
  "categoryId": 4
}
```

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| title | string | ○ | レシピ名（1〜255文字） |
| description | string | × | 説明文 |
| ingredients | string | ○ | 材料（改行区切り） |
| instructions | string | ○ | 作り方（改行区切り） |
| servings | number | × | 何人前（正の整数） |
| cookTime | number | × | 調理時間・分（正の整数） |
| imagePath | string | × | 画像パス（`/api/upload` で取得した値） |
| categoryId | number | × | カテゴリ ID |

### レスポンス（201 Created）

作成されたレシピオブジェクトを返す。（`GET /api/recipes/[id]` と同形式）

---

## GET /api/recipes/[id]

**機能:** 指定した ID のレシピを1件取得する。

### パスパラメータ

| パラメータ | 型 | 説明 |
|-----------|-----|------|
| id | number | レシピ ID |

### リクエスト例

```
GET /api/recipes/1
```

### レスポンス（200 OK）

```json
{
  "id": 1,
  "title": "鶏の唐揚げ",
  "description": "サクサクジューシーな唐揚げ",
  "ingredients": "鶏もも肉 300g\n醤油 大さじ2",
  "instructions": "鶏肉を切る\n漬けダレに漬ける",
  "servings": 2,
  "cookTime": 30,
  "imagePath": "/uploads/1715123456789.jpg",
  "isFavorite": false,
  "categoryId": 4,
  "category": {
    "id": 4,
    "name": "肉類",
    "icon": "🥩"
  },
  "createdAt": "2026-05-09T10:00:00.000Z",
  "updatedAt": "2026-05-09T10:00:00.000Z"
}
```

### エラーレスポンス

| ステータスコード | 条件 |
|---------------|------|
| 404 | 指定した ID のレシピが存在しない |

---

## PUT /api/recipes/[id]

**機能:** 指定した ID のレシピを更新する。画像が変更された場合は旧画像ファイルも削除する。

### パスパラメータ

| パラメータ | 型 | 説明 |
|-----------|-----|------|
| id | number | レシピ ID |

### リクエストボディ

`POST /api/recipes` と同形式。送信しないフィールドは変更されない（全フィールド送信推奨）。

### レスポンス（200 OK）

更新されたレシピオブジェクトを返す。

### エラーレスポンス

| ステータスコード | 条件 |
|---------------|------|
| 404 | 指定した ID のレシピが存在しない |

---

## DELETE /api/recipes/[id]

**機能:** 指定した ID のレシピを削除する。紐づく画像ファイルも `public/uploads/` から削除する。

### パスパラメータ

| パラメータ | 型 | 説明 |
|-----------|-----|------|
| id | number | レシピ ID |

### リクエスト例

```
DELETE /api/recipes/1
```

### レスポンス（204 No Content）

レスポンスボディなし。

### エラーレスポンス

| ステータスコード | 条件 |
|---------------|------|
| 404 | 指定した ID のレシピが存在しない |

---

## PATCH /api/recipes/[id]/favorite

**機能:** 指定した ID のレシピのお気に入り状態をトグルする。

### パスパラメータ

| パラメータ | 型 | 説明 |
|-----------|-----|------|
| id | number | レシピ ID |

### リクエスト例

```
PATCH /api/recipes/1/favorite
```

リクエストボディなし。現在の `isFavorite` の反転値に更新する。

### レスポンス（200 OK）

更新されたレシピオブジェクト全体を返す。（`GET /api/recipes/[id]` と同形式）

---

## GET /api/categories

**機能:** カテゴリ一覧を全件取得する。

### リクエスト例

```
GET /api/categories
```

### レスポンス（200 OK）

```json
[
  { "id": 1, "name": "ご飯もの", "icon": "🍚" },
  { "id": 2, "name": "パン類",   "icon": "🍞" },
  { "id": 3, "name": "麺類",     "icon": "🍜" },
  { "id": 4, "name": "肉類",     "icon": "🥩" },
  { "id": 5, "name": "魚介類",   "icon": "🐟" },
  { "id": 6, "name": "野菜",     "icon": "🥦" },
  { "id": 7, "name": "汁物",     "icon": "🍲" },
  { "id": 8, "name": "スイーツ", "icon": "🍰" },
  { "id": 9, "name": "ドリンク", "icon": "🥤" },
  { "id": 10, "name": "その他",  "icon": "🍽️" }
]
```

---

## POST /api/upload

**機能:** レシピ画像をサーバーにアップロードし、保存先パスを返す。

### リクエスト

- Content-Type: `multipart/form-data`
- フォームフィールド名: `image`（File オブジェクト）

### リクエスト例（fetch）

```typescript
const formData = new FormData()
formData.append('image', file)

const res = await fetch('/api/upload', {
  method: 'POST',
  body: formData,
})
const { imagePath } = await res.json()
// imagePath: "/uploads/1715123456789.jpg"
```

### レスポンス（200 OK）

```json
{ "imagePath": "/uploads/1715123456789.jpg" }
```

保存先: `public/uploads/{タイムスタンプ}.{拡張子}`
URL: `http://localhost:3000/uploads/{ファイル名}` でブラウザから直接アクセス可能

### エラーレスポンス

| ステータスコード | 条件 |
|---------------|------|
| 400 | ファイルが送信されていない |
| 400 | 対応外の MIME タイプ |
| 400 | ファイルサイズが 4MB 超 |
