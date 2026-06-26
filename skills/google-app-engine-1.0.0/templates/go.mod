# Go module template for Google App Engine (Firestore primary)
# Rename this file to go.mod in your service root.

module your-app

go 1.26

require (
	cloud.google.com/go/firestore v1.17.0
	cloud.google.com/go/secretmanager v1.14.0
	cloud.google.com/go/storage v1.43.0
)
