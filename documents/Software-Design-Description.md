## 6.1 Introduction         
This document presents the architecture and detailed design for the fika web application. The project is a dedicated platform for discovering, reviewing, and logging visits to coffee shops based on specific criteria like parking, seating, and amenity availability. The application condenses scattered coffee shop information from various platforms (e.g., Google Reviews, TikTok) into a single, specialized tool.      

### 6.1.1 System Objectives              
The primary objective of the fika application is to provide a single, specialized web-based tool for coffee shop enthusiasts to discover, review, and log their visits, focusing on details often missing from general review platforms.        

The key goals and objectives are:       
* **Discovery and Filtering:** To provide a simple interface for searching and filtering cafes based on criteria pertinent to coffee shop goers, such as parking availability, seating capacity, Wi-Fi, and outlet availability.
* **Comprehensive Cafe Information:** To display individual cafe pages with user-provided reviews, aggregated ratings, and crucial metadata like hours, address, and amenities.
* **User Engagement:** To enable authenticated users to submit new reviews and maintain a personalized log/favorites list of the cafes they have visited.
* **Data Visualization:** To display charts visualizing trends in cafe data to help users make informed choices.
* **Performance and Scalability:** To maintain a smooth and responsive experience, ensuring search results are returned within 3 seconds, and the system can support at least 5,000 concurrent users with 99% monthly uptime.

### 6.1.2 Hardware Interfaces     
The fika application interfaces with specific hardware, software, and human elements in both its execution environment and its use of third-party APIs.      

#### 6.1.2.1 Hardware Interfaces         
* **Client Hardware**: The system relies on standard client-side hardware interfaces, including the Network (Broadband internet connection is required for access) , Display (minimum 1280x800 resolution), Mouse/Trackpad, and Keyboard for user input and navigation.
* **Deployment Hardware:** The application is hosted on cloud infrastructure. The backend/database uses a Cloud-hosted Processor (minimum 2 vCPUs) and RAM (4 GB minimum, scalable with usage). It requires Public internet access with HTTPS/TLS for network communication.     

#### 6.1.2.2 Software Interfaces      
The system integrates with several third-party software components and APIs:  

* **Next.js (latest LTS):** Used for the Frontend development framework, providing server-side rendering and a modern React development environment.
* **PostgreSQL 15+:** The primary database, managed via Supabase, stores cafe records, user accounts, and reviews. It is essential for storing cafe metadata using advanced indexing and JSONB support.
* **Supabase:** Serves as the hosting platform for the backend and managed PostgreSQL database. It is chosen for its ease of integration with PostgreSQL and real-time APIs.
* **Vercel:** Used for hosting the Next.js frontend, ensuring automatic CI/CD integration for frontend code changes.
* **Supabase Authentication:** Handles all user login, signup, and account management, securing access to logging features.
* **OpenStreetMaps API:** Used to provide geographical data on cafes and to visualize cafe locations on the Discover Page map. It is a free and open alternative to commercial mapping APIs.    

#### 6.1.2.3 Human Interfaces
* **User Interface (UI):** The system provides a web-based Graphical User Interface (GUI) accessible via a standard web browser (Chrome, Safari, etc.). The interface is divided into key areas:
  * **Discover Page:** Provides the interface to search, filter, and view cafes on an interactive map.
  * **Cafe Page:** Displays individual cafe details, reviews, and data trends.
  * **User Logging (Favorites/Reviews):** Allows users to save cafes and input new reviews.
  * **Authentication UI:** Provides dedicated login/register screens.      

## 6.2 Architectural Design      
The fika application is based on a three-tier architecture consisting of the Presentation Layer (Frontend), the Application/Business Layer (Backend API and Logic), and the Data Layer (Database). This structure ensures separation of concerns, scalability, and maintainability.        

The system is partitioned into the following four top-level Computer Software Configuration Items (CSCI):   
1. **Frontend CSC:** The user-facing web application.    
2. **Backend CSC:** The core business logic, data management, and API endpoints.
3. **Authentication CSC:** The dedicated system for user account management, managed by Supabase.
4. **Hosting & Infrastructure CSC:** The deployment and environment configuration.         
 
### 6.2.1 Major Software Components       
The major software components are derived from the CSCI breakdown:      
* **Frontend CSC (Presentation Layer):** Built with Next.js. It contains the user interface components:
  * **Discover Page CSU:** Manages cafe search, filtering, and map visualization (using OpenStreetMaps).
  * **Cafe Page CSU:** Renders individual cafe details, aggregated ratings, and trend visualizations (using Vega charts).
  * **User Logging CSU:** Manages user-specific actions like saving favorite cafes and providing an interface for writing new reviews.
    
* **Backend CSC (Application/Data Layer):** Hosted on Supabase and powered by PostgreSQL
  * **Database CSU:** Manages the database schema for storing CafeTable (details, attributes), Review Table (user reviews, ratings), and UserTable (authentication-linked user data).

* **Authentication CSC:** A dedicated Supabase-based system for user login, signup, and account management
  * **Auth CSU:** Manages the core login, logout, and secure session management.
  * **AuthUI module:** Provides the user interface for login and registration screens.
  
* **Hosting & Infrastructure CSC:**
  * **Hosting CSU:** Manages the CI/CD pipelines and deployment of the application components. This includes VercelDeploy (frontend) and SupabaseDeploy (backend services).

### 6.2.2 Major Software Interactions
Communication in the fika architecture is primarily through a client-server model over HTTPS/TLS.     

* **Frontend-Backend/API Interaction:**     
  * The Frontend CSC (Next.js) communicates with the Backend CSC's API CSU via REST/GraphQL endpoints.     
  * The Backend API calls abstract the direct connection to the PostgreSQL database (Database CSU), ensuring business logic is enforced before data retrieval or persistence.   

* **Authentication Interaction:**
  * The Frontend CSC interfaces with the Supabase Authentication CSC for user sign-up and login.
  * The Supabase system provides a secure authentication token upon successful login, which the Frontend uses in subsequent API calls to the Backend.
  * The Backend uses the authentication token to verify the user's identity and restrict access to features like submitting reviews or accessing saved cafes.

* **External API Interaction:**
  * The Frontend's MapView module uses the OpenStreetMaps API to render geographical data and cafe locations.
  * The Frontend's Cafe Page CSU uses the Vega/Vega-Lite library to render visualizations after retrieving the necessary aggregated data from the Backend API

### 6.2.3  Architectural Design Diagrams Section

UML Use Case Diagram:      
<img width="813" height="266" alt="1graph" src="https://github.com/user-attachments/assets/daaaa23f-5db9-41fa-b41e-d675e23acc65" />

Deployment Diagram:      
<img width="710" height="356" alt="2graph" src="https://github.com/user-attachments/assets/50cc85d5-6aad-40dc-baf2-115f22c448ba" />

Component Diagram:      
<img width="662" height="545" alt="3graph" src="https://github.com/user-attachments/assets/69ac0461-aba0-41e7-a8e0-be54226ae9cd" />


## 6.3 Detailed CSC and CSU Descriptions Section        
This section details the Computer Software Components and Computer Software Units that comprise the fika application. The system is divided into logical components based on the three-tier architecture (Frontend, Backend, Database).      

The Frontend CSC is composed of React components and Next.js pages which serve as the CSUs. The Backend CSC consists of service modules that interface with Supabase. The Data CSC consists of the database schemas and types.     
### 6.3.1     
The following sections provide the details of key classes (React components and Service modules) used in the fika application. These classes are selected to represent the core functionality of the discovery and logging systems.

#### 6.3.1.1 Detailed Class Description: CafeMap 
The CafeMap class is responsible for rendering a static location map for a specific cafe within the Cafe Details Page. Due to the Next.js server-side rendering environment, this component utilizes dynamic imports to load the Leaflet library only on the client side.      

* Purpose: To convert a text-based address into geographical coordinates using the Nominatim API and display a pinned marker on an interactive map.      
* Fields (Props & State):     
  * address: String (Prop) - The physical address of the cafe to be geocoded.    
  * cafeName: String (Prop) - The name of the cafe used for the marker popup.
  * coordinates: Object { lat, lon } (State) - The geocoded latitude and longitude derived from the address.
  * loading: Boolean (State) - Tracks the status of the asynchronous geocoding request.
  * isClient: Boolean (State) - A flag used to ensure Leaflet components only render after the component has mounted on the client.      
* Methods:
  * useEffect(setupMarkerIcon): Fixes Leaflet's default icon path issues by manually overriding the icon URLs for the production environment.
  * geocodeAddress(): An asynchronous function triggered when the address prop changes. It fetches data from the OpenStreetMap Nominatim API (nominatim.openstreetmap.org) to convert the string address into coordinates.      
  * MapContainer Render: Dynamically renders the map with a TileLayer and Marker only if coordinates are successfully resolved.

#### 6.3.1.2 Detailed Class Description: CafeService       
The CafeService is a utility class residing in the application layer. It acts as the abstraction layer between the Frontend UI and the Supabase client, handling data fetching and filtering logic.        

* Purpose: To construct and execute database queries against the Supabase PostgreSQL instance, ensuring that raw database logic is decoupled from the UI components.     
* Fields:     
  * supabaseClient: The authenticated instance of the Supabase client used to make requests.     
* Methods:     
  * fetchAllCafes(): Returns a list of all cafes stored in the database.      
  * fetchCafeById(id): Accepts a UUID and returns the detailed metadata for a single cafe.     
  * searchCafes(filters): Accepts a FilterObject (containing boolean flags for wifi, parking, etc.) and constructs a dynamic SQL query to return matching records.     
  * getAggregateRating(cafeId): Queries the Review table to calculate the average score for a specific cafe.    

