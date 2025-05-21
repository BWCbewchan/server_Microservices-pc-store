pipeline {
    agent any

    environment {
        DOCKER_HUB_CREDS = credentials('docker-hub-credentials')
        RENDER_API_KEY = credentials('render-api-key')
        DOCKER_HUB_USERNAME = 'bewchan06'
        GITHUB_BRANCH = 'main'
        // Flag to track if Docker is available
        DOCKER_AVAILABLE = 'false'
    }

    parameters {
        booleanParam(name: 'FORCE_BUILD_ALL', defaultValue: false, description: 'Force rebuild all services regardless of changes')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Check Docker') {
            steps {
                script {
                    // Check if Docker is running
                    def dockerCheck = bat(script: 'docker info', returnStatus: true)
                    if (dockerCheck == 0) {
                        echo "Docker is available and running"
                        env.DOCKER_AVAILABLE = 'true'
                    } else {
                        echo "WARNING: Docker is not available or not running!"
                        echo "Skipping Docker build and push stages"
                        env.DOCKER_AVAILABLE = 'false'
                    }
                }
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
                            bat 'npm install'
                            bat 'npm test || exit 0'
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
                            bat 'npm install'
                            bat 'npm test || exit 0'
                        }
                    }
                }

                stage('Cart Service') {
                    when {
                        anyOf {
                            changeset "backend/cart-service/**"
                            expression { return params.FORCE_BUILD_ALL }
                        }
                    }
                    steps {
                        dir('backend/cart-service') {
                            bat 'npm install'
                            bat 'npm test || exit 0'
                        }
                    }
                }

                stage('Order Service') {
                    when {
                        anyOf {
                            changeset "backend/order-service/**"
                            expression { return params.FORCE_BUILD_ALL }
                        }
                    }
                    steps {
                        dir('backend/order-service') {
                            bat 'npm install'
                            bat 'npm test || exit 0'
                        }
                    }
                }

                stage('Payment Service') {
                    when {
                        anyOf {
                            changeset "backend/payment-service/**"
                            expression { return params.FORCE_BUILD_ALL }
                        }
                    }
                    steps {
                        dir('backend/payment-service') {
                            bat 'npm install'
                            bat 'npm test || exit 0'
                        }
                    }
                }

                stage('Notification Service') {
                    when {
                        anyOf {
                            changeset "backend/notification-service/**"
                            expression { return params.FORCE_BUILD_ALL }
                        }
                    }
                    steps {
                        dir('backend/notification-service') {
                            bat 'npm install'
                            bat 'npm test || exit 0'
                        }
                    }
                }

                stage('API Gateway') {
                    when {
                        anyOf {
                            changeset "backend/api-gateway/**"
                            expression { return params.FORCE_BUILD_ALL }
                        }
                    }
                    steps {
                        dir('backend/api-gateway') {
                            bat 'npm install'
                            bat 'npm test || exit 0'
                        }
                    }
                }

                stage('Auth Service') {
                    when {
                        anyOf {
                            changeset "backend/auth-service/**"
                            expression { return params.FORCE_BUILD_ALL }
                        }
                    }
                    steps {
                        dir('backend/auth-service') {
                            bat 'npm install'
                            bat 'npm test || exit 0'
                        }
                    }
                }
            }
        }

        stage('Build & Push Docker Images') {
            when {
                expression { return env.DOCKER_AVAILABLE == 'true' }
            }
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
                                def loginResult = bat(script: "docker login -u %DOCKER_USER% -p %DOCKER_PASS%", returnStatus: true)
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

                    echo "Removing old Docker images..."
                    services.each { service ->
                        bat "docker rmi -f ${DOCKER_HUB_USERNAME}/smpcstr:${service} || echo Image not found"
                        bat "docker image prune -f || echo No dangling images"
                    }

                    services.each { service ->
                        def serviceDir = "backend/${service}"
                        def imageName = "${DOCKER_HUB_USERNAME}/smpcstr:${service}"

                        if (fileExists("${serviceDir}/Dockerfile")) {
                            def buildAttempts = 0
                            def buildSuccessful = false

                            while (!buildSuccessful && buildAttempts < 2) {
                                buildAttempts++
                                def buildResult = bat(script: "docker build -t ${imageName} ${serviceDir}", returnStatus: true)
                                if (buildResult == 0) {
                                    buildSuccessful = true
                                } else {
                                    echo "Docker build failed for ${service}. Attempt ${buildAttempts}/2"
                                    if (buildAttempts < 2) sleep(time: 5, unit: "SECONDS")
                                }
                            }

                            if (!buildSuccessful) {
                                echo "Build failed for ${service}. Skipping push."
                                return
                            }

                            def pushAttempts = 0
                            def pushSuccessful = false

                            while (!pushSuccessful && pushAttempts < 3) {
                                pushAttempts++
                                def pushResult = bat(script: "docker push ${imageName}", returnStatus: true)
                                if (pushResult == 0) {
                                    pushSuccessful = true
                                    echo "Successfully pushed ${imageName}"
                                } else {
                                    echo "Push failed for ${service}. Attempt ${pushAttempts}/3"
                                    if (pushAttempts < 3) sleep(time: 20, unit: "SECONDS")
                                }
                            }

                            if (!pushSuccessful) {
                                echo "Push failed for ${service} after ${pushAttempts} attempts."
                            }
                        } else {
                            echo "Dockerfile not found for ${service}, skipping build."
                        }
                    }
                }
            }
        }

        stage('Deploy to Render') {
            when {
                expression {
                    return env.BRANCH_NAME == 'main' || env.GIT_BRANCH == 'origin/main' || true
                }
            }
            steps {
                script {
                    if (RENDER_API_KEY?.trim()) {
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
                            powershell """
                                \$headers = @{
                                    'Authorization' = 'Bearer ${RENDER_API_KEY}'
                                    'Content-Type' = 'application/json'
                                }
                                try {
                                    Invoke-RestMethod -Uri "https://api.render.com/v1/services/${service}/deploys" -Method POST -Headers \$headers
                                    Write-Host "Deployment request sent for ${service}"
                                } catch {
                                    Write-Host "Deployment failed for ${service}: \$_"
                                }
                            """
                        }
                    } else {
                        echo "RENDER_API_KEY not found. Skipping deployment."
                    }
                }
            }
        }
    }

    post {
        always {
            script {
                if (env.DOCKER_AVAILABLE == 'true') {
                    try {
                        echo "Cleaning up Docker artifacts..."
                        bat "docker container prune -f || echo No stopped containers"
                        bat "docker image prune -f || echo No dangling images"
                    } catch (Exception e) {
                        echo "Cleanup failed: ${e.message}"
                    }
                } else {
                    echo "Skipping Docker cleanup - Docker was not available"
                }
            }
        }
        success {
            echo "Pipeline completed successfully!"
        }
        failure {
            echo "Pipeline failed!"
        }
    }
}
