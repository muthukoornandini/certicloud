# CertiCloud – Cloud-Based Certificate Management and Verification System

CertiCloud is a cloud-based web application designed to manage digital certificates and verify their authenticity. It allows users to add certificates, view saved records, and verify certificates using a unique certificate ID.

## Project Links

**Project Title: CertiCloud – Cloud-Based Certificate Management and Verification System**

**1. GitHub Repository:**  
[https://github.com/muthukoornandini/certicloud](https://github.com/muthukoornandini/certicloud)

**2. Live Project Website:**  
[https://certicloud-psi.vercel.app/](https://certicloud-psi.vercel.app/)

## Overview

Traditional certificate management can make it difficult to store records and confirm certificate authenticity quickly. CertiCloud provides an online platform to store certificate information and check whether a certificate ID exists in the database.

The application connects a React frontend to a Node.js and Express backend, with certificate records stored in MongoDB Atlas.

## Features

- **Add Certificates:** Enter certificate details and save them.
- **View Certificates:** Display saved certificate records.
- **Certificate Verification:** Check a certificate using its unique ID.
- **Invalid ID Detection:** Reject certificate IDs that do not match a stored record.
- **Cloud Database Integration:** Store and retrieve records using MongoDB Atlas.
- **Online Access:** Access the deployed application through a web browser.

## Technologies Used

| Technology | Purpose |
|---|---|
| React.js | Frontend user interface |
| Vite | Frontend development and build tool |
| Node.js | Backend runtime |
| Express.js | Backend API |
| MongoDB Atlas | Cloud database |
| Vercel | Frontend deployment |
| Render | Backend deployment |
| Git and GitHub | Version control and source code hosting |

## How It Works

1. The user enters certificate information in the web application.
2. The frontend sends the information to the backend API.
3. The backend stores the certificate record in MongoDB Atlas.
4. The application retrieves and displays saved certificate records.
5. The user enters a certificate ID in the verification section.
6. The backend checks the database and returns the verification result.

## Cloud Computing Concepts Used

- **Cloud Hosting:** Makes the application accessible online.
- **Cloud Database:** Stores certificate information in MongoDB Atlas.
- **Client–Server Architecture:** Separates the frontend interface from backend processing.
- **REST API:** Enables communication between the frontend and backend.
- **Scalability:** The architecture can be extended to support additional users and features.

## Benefits

- Simplifies digital certificate record management.
- Enables convenient online certificate verification.
- Allows saved records to be retrieved after refreshing the page.
- Helps identify certificate IDs that are not present in the database.
- Demonstrates the practical use of cloud services in a full-stack application.

## Future Enhancements

- User authentication and role-based access control.
- QR-code-based certificate verification.
- Downloadable digital certificates.
- Certificate expiry tracking and notifications.
- Improved audit logging and security controls.

## Developer

**Muthukoornandini**

GitHub Profile: [https://github.com/muthukoornandini](https://github.com/muthukoornandini)

---

*CertiCloud – Simplifying Digital Certificate Management and Verification.*
