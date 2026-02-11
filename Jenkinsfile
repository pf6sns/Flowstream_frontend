pipeline {
    agent any

    tools {
        // Make sure this matches the Node tool name configured in Jenkins (>= 18 for Next 16)
        nodejs "NodeJS_18"
    }

    environment {
        /* ===============================
           AWS + CloudFront (static hosting)
        =============================== */
        AWS_REGION = "ap-south-1"
        S3_BUCKET  = "flowstream.snssquare.com"
        CLOUDFRONT_DISTRIBUTION_ID = "E1GGR9SL1ZJ7GK"
    }


    stages {
        stage('Check Node.js & npm Versions') {
            steps {
                sh 'node -v'
                sh 'npm -v'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Check Node.js Compatibility') {
            steps {
                script {
                    def nodeVersion = sh(script: "node -v", returnStdout: true).trim().replace("v", "")
                    def majorVersion = nodeVersion.tokenize('.')[0].toInteger()
                    if (majorVersion < 18) {
                        echo "⚠️ Warning: Next.js 16 recommends Node.js >= 18. You're using v${nodeVersion}."
                    }
                }
            }
        }

        stage('Build Next.js App') {
            steps {
                sh 'CI=false npm run build'
                // Export static files for S3/CloudFront from the Next.js app
                sh 'npx next export -o out'
            }
        }

        stage('Upload Build to S3') {
            steps {
                script {
                    sh """
                    aws s3 sync out s3://$S3_BUCKET/ --region $AWS_REGION --delete
                    """
                }
            }
        }

        stage('Invalidate CloudFront Cache') {
            steps {
                script {
                    sh """
                    aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DISTRIBUTION_ID --paths "/*"
                    """
                }
            }
        }
    }

    post {
        success {
            echo '✅ Deployment Successful! 🎉'
        }
        failure {
            echo '❌ Deployment Failed!'
        }
    }
}
