## 4.1 Plan Introduction      
This Software Development Plan provides the details of the planned development for the Fika Web Application CSCI, a dedicated platform for discovering, reviewing, and logging visits to coffee shops based on specific criteria like parking, seating, and amenity availability.      

The Fika application addresses the current fragmentation of coffee shop information by condensing data from various platforms (e.g., Google Reviews, TikTok) into a single, specialized tool. Its core value lies in providing specific details relevant to coffee shop goers, such as Wi-Fi, outlets, and seating capacity, which are often absent from general restaurant review sites. The application will be developed using a Next.js frontend, a PostgreSQL database managed by Supabase, and integrated with OpenStreetMaps for geographical data visualization. Development activities include architectural design, implementation of the frontend (Discover, Cafe, and User Logging pages) and backend APIs, integration of third-party services (Firebase for authentication, Vega for visualization), and continuous testing.      

The project will adhere to a Waterfall development methodology. This approach emphasizes sequential phases, where all planning and design are completed and documented before implementation begins. 

# The major phases are: Requirements, Design, Implementation, Testing, and Deployment:
* Requirements Phase (Weeks 01-05): Focuses on gathering, analyzing, and documenting all functional and non-functional requirements, culminating in the Software Requirements Specification (SRS).

* Design Phase (Weeks 06-12): Focuses on converting the requirements into a system architecture and detailed design, including component breakdown, database schema, and interface definitions. This phase produces the Software Design Document (SDD).

* Implementation Phase (Weeks 10-16): Developers write and integrate the code for the Next.js frontend, backend APIs, and third-party services, based on the finalized design.

* Testing Phase (Weeks 13-16): Includes unit testing, integration testing, and system testing, leading to the Alpha/Beta Demonstration and refinement of the final product.

Deployment/Maintenance Phase (Week 16): Involves final delivery, code freeze, and hand-off of the fully documented, production-ready application.
The project's major milestones are scheduled as follows:    
* Requirements Specification Finalization: Week 05    
* Software Development Plan (SDP) Completion: Week 07     
* Architectural Design Completion (SDD Part 1): Week 10    
* Detailed Design & Test Plan Finalization (SDD Part 2): Week 12    
* Alpha/Beta Demonstration & Critical Design Review: Weeks 13-14    
* Final Project Demonstration: Week 15    
* Final Product Delivery & Code Freeze: Week 16    

### 4.1.1 Project Deliverables      
The following items will be delivered to the customer (instructor) during the course of the project:

* Software Requirements Specification (SRS): [Delivery Date: 09/24/2025]    
    * This document provides a complete and detailed outline of the functional (5.3), performance (5.4), and environmental (5.5) requirements for the Fika application, serving as the foundational contract for development.      

* Software Design Document (SDD): [Delivery Date: 09/24/2025]    
    * Details the architectural design, including the CSCI component breakdown (Frontend, Backend, Auth), the PostgreSQL database schema, and interface specifications for the API and all third-party services (OpenStreetMaps, Firebase).     

* Software Development Plan (SDP): [Delivery Date: 10/08/2025]       
    * Outlines the development approach, resource allocation (hardware, software, human), and the high-level task schedule for the project development lifecycle.       

* Software Design Description Document (Architecture Section): [Delivery Date: 11/05/2025]     
    * Presents the overall architecture of the software system as well as the details of the application's design.
 
* Software Design Description Document (Detailed Section): [Delivery Date: 11/19/2025]     
    * This is the finalized, complete SDD, which expands upon the architectural design by providing the detailed design of all components and subsystems. It includes implementation specifics, data structures, and detailed interfaces, representing the Description phase of design where concepts are ready for implementation in code.     

* Fika Final Web Application: [Delivery Date: 12/10/2025]     
    * The complete, production-ready web application meeting all functional requirements. This includes advanced features such as:     
        * Full filtering and search capability on the Discover Page (5.3.1.5).     
        * OpenStreetMaps integration for geographical display (5.3.1.4).    
        * Vega Charts displaying trends on the Cafe Page (5.3.1.9).    
        * Complete User Logging subsystem (saving cafes, submitting reviews) (5.3.1.8, 5.3.1.10).     

* Final Repository & Documentation: Includes the full source code, deployment configuration, and a final demonstration of all features.    


## 4.2 Project Resources   
Resources are critical elements that must be managed to ensure project completion. This section details the hardware and software assets required for the development and deployment of Fika.      

### 4.2.1 Hardware Resources     
Following are the hardware requirements for development of fika:  

| Category          | Requirement                              |  
|-------------------|------------------------------------------|  
| Processor         | Intel i5 (8th Gen) or Apple M1 or higher |  
| Hard Drive Space  | 20 GB free space                         |  
| RAM               | 8 GB minimum, 16 GB recommended          |  
| Display           | 1280x800 resolution or higher            |  
| Network           | Broadband internet connection required   |  

### 4.2.2 Software Resources            
Following are the software requirements for development of fika:  

| Category          | Requirement                                   |  
|-------------------|-----------------------------------------------|  
| Operating System  | macOS 12+, Windows 10+, or Ubuntu 22.04       |  
| Framework         | Next.js (v.14+)                          |  
| Database          | PostgreSQL 15+                                |  
| Hosting Tools     | Vercel CLI, Supabase CLI                      |  
| Authentication    | Supabase                                  |  
| API Integration   | OpenStreetMaps API, optional Google Places API |  
| Visualization     | Vega/Vega-Lite (v.5+)                                |  
| Programming Tools | Node.js 18+, npm or yarn, Git, VS Code        |  

**Notes:**  
- Node.js 18+ is required for compatibility with Next.js.  
- PostgreSQL 15+ provides advanced indexing and JSONB support, necessary for cafe metadata.  
- Supabase is chosen for ease of integration with PostgreSQL and real-time APIs.
- Licensing/ cost is free.
  
## 4.3 Project Organization    
This section outlines the organizational structure of the Fika development team by assigning primary responsibilities for key functional areas and tasks to each team member. This approach ensures clear ownership and accountability across the project's lifecycle.   

| **Team Member** | **Assigned Tasks & Responsibilities** |
|------------------|---------------------------------------|
| Backend/ API Lead: Giselle | Cafe Page UI/UX,Detailed Cafe Page |
| Frontend/Mapping Lead: Jillian | Cafe Page UI/UX, Map Functionality (OpenStreetMaps API) |
| UI/UX/ Datat visulization Specialist: Kate | Home Page UI/UX, Data Visualization (Vega Charts), Discover Page Filtering Logic |
| Database/ Authentication Specialist: Ahtziri | Cafe Page UI/UX, User Logging Subsystem |
| All Members | Initial Environment Setup, UX Design, Unit/Integration Testing, Manual Testing, Data Entry, API Research |

# Communication Plan
* Daily Stand-ups: Brief text and in-person updates to report on what was done yesterday, what will be done today, and any roadblocks.
* Weekly in person meetings/ code sessions: in-depth progress reviews, goals for the week, major design issues/changes.
* Code reviews: Any major code changes were reviewed before being merged and committed.
## 4.4 Schedule
This section provides schedule information for the **fika** project.

---

### 4.4.1 PERT Chart or GANTT Chart
**GANTT Chart**

![GANNT Chart](../documents/gannt.png)
****

---

### 4.4.2 Task/Resource Table

This table details the relationship between each task and the resources required to complete it. This ensures that the workload is distributed properly among team members and other resources.

| Task | Estimated Duration | Assigned To | Resources (Hardware/Software) |
|---|---|---|---|
| **Setting up dev enviorment** | 2 days | All Members | VSCode, Supabase, Vercel, GitHub, Node.js, npm |
| **Create UX Designs** | 2 weeks | All Members | Figma, Gemini mocks, Photoshop |
| **Create Home Page** | 2 weeks | Kate | Next.js, VSCode, Gemini mocks, Figma, CSS help tools |
| **Create Cafe Page** | 2 weeks | Jillian | Next.js, VSCode, Gemini mocks, Figma, UI kits |
| **Create Basic Discover Page** | 2 week | Ahtziri | VSCode, Gemini mocks, Figma |
| **Write Unit and Intergration Tests** | 6 weeks | All members | VSCode |
| **Manually Testing** | 2 weeks | All members | VSCode |
| **Add Filtering Functionality** | 2-3 days | Giselle | VSCode, Supabase |
| **Add Map Functionality** | 1 week | Jillian | OpenStreetsMap API |
| **Add Data Visualizations** | 2 weeks | Kate | Vega, VSCode |
| **Create Logging Functionality** | 1 week | Giselle | Supabase, VSCode |
| **Manually Input Cafes** | 5 weeks | All members | VSCode, Google maps, Yelp, Google |
| **Experiment with APIs** | 3 weeks | All members | OpenStreetsMap, GooglePlaces, Yelp Fusion |     
