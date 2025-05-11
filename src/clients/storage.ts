import { config } from "@/config";
import { S3, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

class StorageClient {
  private _s3Client: S3;
  private _endpoint: string;
  private _bucketName: string;

  constructor({
    bucketName,
    endpoint,
    accessId,
    secretKey,
  }: {
    bucketName: string;
    endpoint: string;
    accessId: string;
    secretKey: string;
  }) {
    this._bucketName = bucketName;
    this._endpoint = endpoint;
    this._s3Client = new S3({
      forcePathStyle: false,
      endpoint: `https://${endpoint}`,
      region: "us-east-1", // Ref: https://docs.digitalocean.com/products/spaces/how-to/use-aws-sdks/
      credentials: {
        accessKeyId: accessId,
        secretAccessKey: secretKey,
      },
    });
  }

  async uploadFile({
    buf,
    path,
  }: {
    buf: ArrayBuffer;
    path: string;
  }): Promise<string> {
    const fileContent = Buffer.from(buf);

    return new Promise((resolve, reject) =>
      this._s3Client.putObject(
        {
          Bucket: this._bucketName,
          Key: path,
          Body: fileContent,
        },
        (err, _data) => {
          if (err) {
            reject(err);
          }

          resolve(path);
        }
      )
    );
  }

  async getPresignedUrl(url: string) {
    const path = url.replaceAll(
      "https://roleplay-realm-archive-storage.sfo3.digitaloceanspaces.com/",
      ""
    );
    const command = new GetObjectCommand({
      Bucket: this._bucketName,
      Key: path,
    });
    const newUrl = await getSignedUrl(this._s3Client, command, {
      expiresIn: 60 * 60 * 24, // 30 days
    });
    return newUrl;
  }

  private _getMimeTypeExtension(mimeType: string) {
    switch (mimeType) {
      case "image/png":
        return ".png";
      case "image/jpeg":
        return ".jpg";
      default:
        return "";
    }
  }
}

const storage = Object.freeze(
  new StorageClient({
    bucketName: config.doSpacesBucketName,
    endpoint: config.doSpacesEndpoint,
    accessId: config.doSpacesAccessId,
    secretKey: config.doSpacesSecretKey,
  })
);

export default storage;
