const {
	S3Client,
	PutObjectCommand,
	GetObjectCommand,
	DeleteObjectCommand
} = require("@aws-sdk/client-s3")
const config = require("../config/config")

const s3Client = new S3Client({
	region: config.AWS_REGION
})

async function uploadResumePdf({ s3Key, pdfBuffer }) {
	await s3Client.send(new PutObjectCommand({
		Bucket: config.S3_BUCKET_NAME,
		Key: s3Key,
		Body: pdfBuffer,
		ContentType: "application/pdf"
	}))
}

async function getResumePdf(s3Key) {
	const response = await s3Client.send(new GetObjectCommand({
		Bucket: config.S3_BUCKET_NAME,
		Key: s3Key
	}))

	if (!response.Body) {
		throw new Error("S3 object did not contain a response body")
	}

	const chunks = []
	for await (const chunk of response.Body) {
		chunks.push(Buffer.from(chunk))
	}

	return Buffer.concat(chunks)
}

async function deleteResumePdf(s3Key) {
	await s3Client.send(new DeleteObjectCommand({
		Bucket: config.S3_BUCKET_NAME,
		Key: s3Key
	}))
}

module.exports = {
	uploadResumePdf,
	getResumePdf,
	deleteResumePdf
}
