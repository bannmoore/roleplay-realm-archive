import { config } from "@/config";
import { S3 } from "@aws-sdk/client-s3";

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

  async uploadMessageAttachment({
    buf,
    filename,
    serverId,
    channelId,
    messageId,
  }: {
    buf: ArrayBuffer;
    filename: string;
    serverId: string;
    channelId: string;
    messageId: string;
  }): Promise<string> {
    const fileContent = Buffer.from(buf);
    const path = `message-attachments/server-${serverId}/channel-${channelId}/message-${messageId}/${filename}`;

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

          resolve(`https://${this._bucketName}.${this._endpoint}/${path}`);
        }
      )
    );
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
