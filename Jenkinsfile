pipeline {
    agent any

    parameters {
        booleanParam(name: 'FORCE_BUILD_ALL', defaultValue: false, description: 'Force rebuild all services')
    }

    environment {
        DOCKER_HUB_CREDS = credentials('docker-hub-credentials')
        RENDER_API_KEY = credentials('render-api-key')
        DOCKER_HUB_USERNAME = 'bewchan06'
        GITHUB_BRANCH = 'main'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build & Test Services') {
            parallel {
                stage('Product Catalog Service') {
                    when {
                        anyOf {
                            changeset "backend/product-catalog-service/**"
                            expression { return params.FORCE_BUILD_ALL }
                        }
                    }
                    steps {
                        dir('backend/product-catalog-service') {
                            script {
                                if (isUnix()) {
                                    sh 'npm install'
                                    sh 'npm test || exit 0'
                                } else {
                                    bat 'npm install'
                                    bat 'npm test || exit 0'
                                }
                            }
                        }
                    }
                }

                stage('Inventory Service') {
                    when {
                        anyOf {
                            changeset "backend/inventory-service/**"
                            expression { return params.FORCE_BUILD_ALL }
                        }
                    }
                    steps {
                        dir('backend/inventory-service') {
                            script {
                                if (isUnix()) {
                                    sh 'npm install'
                                    sh 'npm test || exit 0'
                                } else {
                                    bat 'npm install'
                                    bat 'npm test || exit 0'
                                }
                            }
                        }
                    }
                }

                // Các stage khác tương tự...

            }
        }

        stage('Build & Push Docker Images') {
            steps {
                script {
                    echo "Starting Docker build and push for services..."

                    def loginAttempts = 0
                    def loginSuccessful = false

                    while (!loginSuccessful && loginAttempts < 3) {
                        loginAttempts++
                        echo "Attempt ${loginAttempts} to log in to Docker Hub..."

                        withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials',
                                        usernameVariable: 'DOCKER_USER',
                                        passwordVariable: 'DOCKER_PASS')]) {
                            try {
                                def loginResult = isUnix() ? sh(script: "docker login -u $DOCKER_USER -p $DOCKER_PASS", returnStatus: true)
                                                           : bat(script: "docker login -u %DOCKER_USER% -p %DOCKER_PASS%", returnStatus: true)
                                if (loginResult == 0) {
                                    echo "Docker Hub login successful"
                                    loginSuccessful = true
                                } else {
                                    echo "Docker login failed. Will retry in 10 seconds..."
                                    sleep(time: 10, unit: "SECONDS")
                                }
                            } catch (Exception e) {
                                echo "Exception during Docker login: ${e.message}. Will retry in 10 seconds..."
                                sleep(time: 10, unit: "SECONDS")
                            }
                        }
                    }

                    if (!loginSuccessful) {
                        error "Failed to log in to Docker Hub after ${loginAttempts} attempts. Skipping build and push."
                    }

                    def services = ["product-catalog-service", "inventory-service", "cart-service", "notification-service", "order-service", "api-gateway", "auth-service", "payment-service"]

                    echo "Removing old Docker images for all services..."
                    services.each { service ->
                        def removeCmd = isUnix() ? "docker rmi -f ${DOCKER_HUB_USERNAME}/smpcstr:${service} || echo Image not found"
                                                 : "docker rmi -f ${DOCKER_HUB_USERNAME}/smpcstr:${service} || echo Image not found"
                        def pruneCmd = isUnix() ? "docker image prune -f || echo No dangling images"
                                                : "docker image prune -f || echo No dangling images"
                        if (isUnix()) {
                            sh removeCmd
                            sh pruneCmd
                        } else {
                            bat removeCmd
                            bat pruneCmd
                        }
                    }

                    services.each { service ->
                        def serviceDir = "backend/${service}"

                        if (fileExists("${serviceDir}/Dockerfile")) {
                            echo "Building Docker image for ${service}..."
                            def imageName = "${DOCKER_HUB_USERNAME}/smpcstr:${service}"

                            def buildAttempts = 0
                            def buildSuccessful = false

                            while (!buildSuccessful && buildAttempts < 2) {
                                buildAttempts++
                                try {
                                    def buildResult = isUnix() ? sh(script: "docker build -t ${imageName} ${serviceDir}", returnStatus: true)
                                                               : bat(script: "docker build -t ${imageName} ${serviceDir}", returnStatus: true)
                                    if (buildResult == 0) {
                                        buildSuccessful = true
                                    } else {
                                        echo "Docker build failed for ${service}. Attempt ${buildAttempts}/2"
                                        if (buildAttempts < 2) sleep(time: 5, unit: "SECONDS")
                                    }
                                } catch (Exception e) {
                                    echo "Exception during Docker build for ${service}: ${e.message}"
                                    if (buildAttempts < 2) sleep(time: 5, unit: "SECONDS")
                                }
                            }

                            if (!buildSuccessful) {
                                echo "Failed to build Docker image for ${service} after ${buildAttempts} attempts. Skipping push."
                                return
                            }

                            echo "Pushing Docker image for ${service}..."
                            def pushAttempts = 0
                            def pushSuccessful = false

                            while (!pushSuccessful && pushAttempts < 3) {
                                pushAttempts++
                                try {
                                    def pushResult = isUnix() ? sh(script: "docker push ${imageName}", returnStatus: true)
                                                               : bat(script: "docker push ${imageName}", returnStatus: true)
                                    if (pushResult == 0) {
                                        pushSuccessful = true
                                        echo "Successfully pushed ${imageName}"
                                    } else {
                                        echo "Docker push failed for ${service}. Attempt ${pushAttempts}/3"
                                        if (pushAttempts < 3) {
                                            echo "Waiting 20 seconds before retrying..."
                                            sleep(time: 20, unit: "SECONDS")
                                        }
                                    }
                                } catch (Exception e) {
                                    echo "Exception during Docker push for ${service}: ${e.message}"
                                    if (pushAttempts < 3) {
                                        echo "Waiting 20 seconds before retrying..."
                                        sleep(time: 20, unit: "SECONDS")
                                    }
                                }
                            }

                            if (pushSuccessful) {
                                echo "Completed build and push for ${service}"
                            } else {
                                echo "Failed to push Docker image for ${service} after ${pushAttempts} attempts."
                            }
                        } else {
                            echo "Skipping Docker build for ${service} - Dockerfile not found."
                        }
                    }
                }
            }
        }

        stage('Deploy to Render') {
            when {
                expression {
                    return env.BRANCH_NAME == 'main' || env.GIT_BRANCH == 'origin/main'
                }
            }
            steps {
                script {
                    echo "Starting deployment to Render..."

                    if (RENDER_API_KEY?.trim()) {
                        echo "Render API key found, proceeding with deployment..."

                        def services = [
                            "kt-tkpm-project-product-catalog-service",
                            "kt-tkpm-project-inventory-service",
                            "kt-tkpm-project-cart-service",
                            "kt-tkpm-project-notification-service",
                            "kt-tkpm-project-order-service",
                            "kt-tkpm-project-api-gateway",
                            "kt-tkpm-project-payment-service",
                            "kt-tkpm-project-auth-service"
                        ]

                        services.each { service ->
                            echo "Triggering deployment for service: ${service}"
                            if (isUnix()) {
                                sh """
                                    curl -X POST https://api.render.com/v1/services/${service}/deploys \\
                                    -H 'Authorization: Bearer ${RENDER_API_KEY}' \\
                                    -H 'Content-Type: application/json'
                                """
                            } else {
                                powershell """
                                    \$headers = @{
                                        'Authorization' = 'Bearer ${RENDER_API_KEY}'
                                        'Content-Type' = 'application/json'
                                    }
                                    try {
                                        Invoke-RestMethod -Uri "https://api.render.com/v1/services/${service}/deploys" -Method POST -Headers \$headers
                                        Write-Host "Deployment request sent for ${service}"
                                    } catch {
                                        Write-Host "Deployment request for ${service} failed but continuing: \$_"
                                    }
                                """
                            }
                        }
                    } else {
                        echo "Warning: No Render API key found. Skipping deployment step."
                    }
                }
            }
        }
    }

    post {
        always {
            script {
                try {
                    echo "Cleaning up Docker images and containers..."

                    def pruneContainersCmd = isUnix() ? "docker container prune -f || echo No stopped containers"
                                                      : "docker container prune -f || echo No stopped containers"
                    def pruneImagesCmd = isUnix() ? "docker image prune -f || echo No dangling images"
                                                  : "docker image prune -f || echo No dangling images"

                    if (isUnix()) {
                        sh pruneContainersCmd
                        sh pruneImagesCmd
                    } else {
                        bat pruneContainersCmd
                        bat pruneImagesCmd
                    }

                    echo "Docker cleanup completed"
                } catch (Exception e) {
                    echo "Warning: Docker cleanup failed: ${e.message}"
                }
            }
        }
        success {
            echo "Pipeline completed successfully!"
        }
        failure {
            echo "Pipeline failed! Check the logs for details."
        }
    }
}
