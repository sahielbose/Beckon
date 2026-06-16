import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3"

// S3 compatible object storage (MinIO locally, S3 in the cloud), configured from
// the existing S3_ environment variables. Used to persist the original uploaded
// file so re-indexing never requires re-uploading.

const endpoint = process.env.S3_ENDPOINT
const region = process.env.S3_REGION ?? "us-east-1"
const accessKeyId = process.env.S3_ACCESS_KEY_ID
const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY
const forcePathStyle = process.env.S3_FORCE_PATH_STYLE !== "false"

export const STORAGE_BUCKET = process.env.S3_BUCKET ?? "beckon"

/** Whether object storage is configured. When false, ingestion runs from the
 * in hand buffer once and is not persisted (local offline path). */
export function isStorageConfigured(): boolean {
  return Boolean(endpoint && accessKeyId && secretAccessKey)
}

let client: S3Client | null = null
function getClient(): S3Client {
  if (!client) {
    client = new S3Client({
      region,
      endpoint,
      forcePathStyle,
      credentials: accessKeyId && secretAccessKey ? { accessKeyId, secretAccessKey } : undefined,
    })
  }
  return client
}

/** Object key for a source's original file. */
export function sourceObjectKey(agentId: string, sourceId: string, fileName: string): string {
  const safe = fileName.replace(/[^\w.\-]+/g, "_")
  return `agents/${agentId}/sources/${sourceId}/${safe}`
}

export async function putObject(key: string, body: Buffer, contentType?: string): Promise<void> {
  await getClient().send(
    new PutObjectCommand({
      Bucket: STORAGE_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  )
}

export async function getObject(key: string): Promise<Buffer> {
  const res = await getClient().send(new GetObjectCommand({ Bucket: STORAGE_BUCKET, Key: key }))
  if (!res.Body) throw new Error("The stored file could not be read.")
  const bytes = await res.Body.transformToByteArray()
  return Buffer.from(bytes)
}

export async function deleteObject(key: string): Promise<void> {
  await getClient().send(new DeleteObjectCommand({ Bucket: STORAGE_BUCKET, Key: key }))
}
