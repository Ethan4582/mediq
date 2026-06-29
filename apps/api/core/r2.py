import boto3
from core.config import settings

_s3 = boto3.client(
    "s3",
    endpoint_url=settings.CLOUDFLARE_R2_ENDPOINT,
    aws_access_key_id=settings.CLOUDFLARE_R2_ACCESS_KEY,
    aws_secret_access_key=settings.CLOUDFLARE_R2_SECRET_KEY,
    region_name="auto",
)

def upload_file(file_bytes: bytes, key: str, content_type: str) -> str:
    _s3.put_object(
        Bucket=settings.CLOUDFLARE_R2_BUCKET,
        Key=key,
        Body=file_bytes,
        ContentType=content_type,
    )
    return key

def download_file(key: str) -> bytes:
    resp = _s3.get_object(Bucket=settings.CLOUDFLARE_R2_BUCKET, Key=key)
    return resp["Body"].read()

def get_presigned_url(key: str, expires: int = 3600) -> str:
    return _s3.generate_presigned_url(
        "get_object",
        Params={"Bucket": settings.CLOUDFLARE_R2_BUCKET, "Key": key},
        ExpiresIn=expires,
    )
