import sys
import os
from datetime import datetime

from app.database.session import SessionLocal, engine, Base
from app.database.models import (
    User, Trade, Skill, StudentProfile, StudentSkill, Company, Job, JobSkill,
    Institute, GovernmentScheme, Apprenticeship, scheme_trades
)
from app.api.auth_deps import get_password_hash

def seed_database():
    # Ensure tables are created
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        if db.query(Trade).count() > 0:
            print("Database already contains trade records. Skipping full seed.")
            return

        print("Seeding SkillMatch database with vocational Indian industrial data...")

        # 1. TRADES
        trades_data = [
            {
                "code": "welder",
                "name": "ITI Welder",
                "description": "Welding, metal fabrication, arc/MIG/TIG welding and industrial inspection.",
                "icon": "Flame"
            },
            {
                "code": "electrician",
                "name": "ITI Electrician",
                "description": "Electrical wiring, motor repair, industrial control panels, PLC basics and power distribution.",
                "icon": "Zap"
            },
            {
                "code": "fitter",
                "name": "ITI Fitter",
                "description": "Mechanical assembly, lathe operation, machine installation, pneumatic and hydraulic maintenance.",
                "icon": "Wrench"
            }
        ]

        trade_objs = {}
        for td in trades_data:
            trade = Trade(**td)
            db.add(trade)
            db.flush()
            trade_objs[td["code"]] = trade

        # 2. CONTROLLED SKILLS
        trade_skills_map = {
            "welder": [
                "Arc Welding", "MIG Welding", "TIG Welding", "Gas Welding",
                "Pipe Welding", "Metal Fabrication", "Cutting", "Grinding",
                "Welding Inspection", "Blueprint Reading"
            ],
            "electrician": [
                "Electrical Wiring", "Industrial Wiring", "Motor Repair", "Panel Wiring",
                "PLC Basics", "Electrical Maintenance", "Troubleshooting", "Control Panels",
                "Installation", "Electrical Safety"
            ],
            "fitter": [
                "Machine Assembly", "Lathe Operation", "Mechanical Maintenance", "Machine Installation",
                "Measurement Tools", "Hydraulic Systems", "Pneumatic Systems", "Preventive Maintenance",
                "Blueprint Reading", "Basic Welding"
            ]
        }

        skill_objs = {}
        for code, skills in trade_skills_map.items():
            trade_id = trade_objs[code].id
            for sname in skills:
                skill = Skill(name=sname, category="Core Technical", trade_id=trade_id, is_active=True)
                db.add(skill)
                db.flush()
                skill_objs[f"{code}:{sname}"] = skill

        # 3. COMPANIES (20+ Top Industrial Employers & MSME Hubs)
        companies_data = [
            {
                "name": "Bharat Forge Ltd",
                "industry": "Automotive & Forging",
                "location": "Mundhwa & Chakan",
                "city": "Pune",
                "state": "Maharashtra",
                "description": "Leading global manufacturing conglomerate specializing in forging, automotive components, and heavy engineering.",
                "website": "https://www.bharatforge.com",
                "contact_email": "careers@bharatforge.com",
                "contact_phone": "+91 20 6704 2777"
            },
            {
                "name": "Tata Motors Vendor Network",
                "industry": "Automotive Manufacturing",
                "location": "Pimpri & Chakan",
                "city": "Pune",
                "state": "Maharashtra",
                "description": "Commercial and passenger vehicle assembly units and tier-1 vendor ecosystem.",
                "website": "https://www.tatamotors.com",
                "contact_email": "hr.vocational@tatamotors.com",
                "contact_phone": "+91 20 6613 1111"
            },
            {
                "name": "Thermax Limited",
                "industry": "Energy & Heavy Engineering",
                "location": "Bhosari Industrial Area",
                "city": "Pune",
                "state": "Maharashtra",
                "description": "Global engineering company providing heating, cooling, and environmental solutions.",
                "website": "https://www.thermaxglobal.com",
                "contact_email": "recruitment@thermaxglobal.com",
                "contact_phone": "+91 20 6612 2999"
            },
            {
                "name": "Larsen & Toubro Heavy Engineering",
                "industry": "Heavy Fabrication & Defense",
                "location": "Hazira & Powai",
                "city": "Mumbai",
                "state": "Maharashtra",
                "description": "Pioneers in high-tech fabrication for nuclear, defense, and process plant equipment.",
                "website": "https://www.larsentoubro.com",
                "contact_email": "careers.heavyeng@larsentoubro.com",
                "contact_phone": "+91 22 6752 5656"
            },
            {
                "name": "Bosch India Limited",
                "industry": "Automotive Electricals & Systems",
                "location": "Adugodi & Naganathapura",
                "city": "Bangalore",
                "state": "Karnataka",
                "description": "Leading supplier of technology and services in automotive powertrain, electrical drives, and sensors.",
                "website": "https://www.bosch.in",
                "contact_email": "campus.connect@in.bosch.com",
                "contact_phone": "+91 80 6752 1111"
            },
            {
                "name": "Schneider Electric India",
                "industry": "Energy Management & Automation",
                "location": "Peenya Industrial Area",
                "city": "Bangalore",
                "state": "Karnataka",
                "description": "Global specialist in energy management, industrial switchgear, control panels, and automation.",
                "website": "https://www.se.com/in",
                "contact_email": "jobs.india@se.com",
                "contact_phone": "+91 80 4110 5000"
            },
            {
                "name": "Mahindra & Mahindra Auto Division",
                "industry": "Automotive Assembly",
                "location": "Chakan MIDC Phase 2",
                "city": "Pune",
                "state": "Maharashtra",
                "description": "Advanced robotics, stamping, body-in-white welding, and mechanical assembly facility.",
                "website": "https://www.mahindra.com",
                "contact_email": "jobs.chakan@mahindra.com",
                "contact_phone": "+91 2135 667000"
            },
            {
                "name": "Siemens Industrial Automation",
                "industry": "Control Panels & Power",
                "location": "Kalwa Works, Thane",
                "city": "Mumbai",
                "state": "Maharashtra",
                "description": "Manufacturer of switchboards, low-voltage control panels, PLC automation drives, and motors.",
                "website": "https://www.siemens.com/in",
                "contact_email": "contact.india@siemens.com",
                "contact_phone": "+91 22 3967 7000"
            },
            {
                "name": "Godrej & Boyce Mfg. Co. Ltd",
                "industry": "Precision Engineering & Tooling",
                "location": "Vikhroli & Shirwal",
                "city": "Mumbai",
                "state": "Maharashtra",
                "description": "Precision tool manufacturing, aerospace fabrication, press tools, and material handling systems.",
                "website": "https://www.godrej.com",
                "contact_email": "careers@godrej.com",
                "contact_phone": "+91 22 6796 5656"
            },
            {
                "name": "Kirloskar Brothers Limited",
                "industry": "Pumps & Hydraulics",
                "location": "Kirloskarvadi & Kondhwa",
                "city": "Pune",
                "state": "Maharashtra",
                "description": "India's premier pump manufacturer specializing in hydraulic systems, casting, and fitting.",
                "website": "https://www.kirloskarpumps.com",
                "contact_email": "kbl.talent@kbl.co.in",
                "contact_phone": "+91 20 2444 0770"
            },
            {
                "name": "Uno Minda Limited",
                "industry": "Auto Electricals & Switchgear",
                "location": "IMT Manesar",
                "city": "Gurgaon",
                "state": "Haryana",
                "description": "Manufacturer of automotive switches, sensors, wire harnesses, and lighting systems.",
                "website": "https://www.unominda.com",
                "contact_email": "hr.manesar@unominda.com",
                "contact_phone": "+91 124 229 0427"
            },
            {
                "name": "Motherson Sumi Wiring India",
                "industry": "Automotive Wiring Systems",
                "location": "Noida & Sriperumbudur",
                "city": "Chennai",
                "state": "Tamil Nadu",
                "description": "Leading manufacturer of automotive electrical wiring harnesses and power components.",
                "website": "https://www.mswil.motherson.com",
                "contact_email": "recruitment@motherson.com",
                "contact_phone": "+91 44 2715 6200"
            },
            {
                "name": "TVS Motor Company",
                "industry": "Two-Wheeler Manufacturing",
                "location": "Hosur Plant 1 & 2",
                "city": "Chennai",
                "state": "Tamil Nadu",
                "description": "Major automotive manufacturer known for engine assembly, sheet metal fabrication, and painting.",
                "website": "https://www.tvsmotor.com",
                "contact_email": "talent.hosur@tvsmotor.com",
                "contact_phone": "+91 4344 276780"
            },
            {
                "name": "Ashok Leyland Limited",
                "industry": "Commercial Vehicles",
                "location": "Ennore & Hosur",
                "city": "Chennai",
                "state": "Tamil Nadu",
                "description": "Flagship company of the Hinduja Group producing chassis, heavy gearboxes, and diesel powertrains.",
                "website": "https://www.ashokleyland.com",
                "contact_email": "enquiry@ashokleyland.com",
                "contact_phone": "+91 44 2575 2200"
            },
            {
                "name": "Endurance Technologies Ltd",
                "industry": "Die Casting & Transmission",
                "location": "Waluj MIDC & Chakan",
                "city": "Pune",
                "state": "Maharashtra",
                "description": "Aluminium die casting, suspension, and brake system manufacturing.",
                "website": "https://www.endurancegroup.com",
                "contact_email": "endurance.jobs@endurance.co.in",
                "contact_phone": "+91 240 256 9600"
            },
            {
                "name": "Cummins India Limited",
                "industry": "Diesel Engines & Generators",
                "location": "Kothrud & Phaltan Megasite",
                "city": "Pune",
                "state": "Maharashtra",
                "description": "Designer and manufacturer of internal combustion engines, generator sets, and power filtration.",
                "website": "https://www.cummins.com/en/in",
                "contact_email": "india.careers@cummins.com",
                "contact_phone": "+91 20 6706 7000"
            },
            {
                "name": "BEML Limited",
                "industry": "Rail Coaches & Mining Equipment",
                "location": "Bangalore Complex, New Thippasandra",
                "city": "Bangalore",
                "state": "Karnataka",
                "description": "Public sector enterprise manufacturing metro coaches, heavy earthmoving equipment, and defense components.",
                "website": "https://www.bemlindia.in",
                "contact_email": "recruitment@beml.co.in",
                "contact_phone": "+91 80 2524 2414"
            },
            {
                "name": "Force Motors Limited",
                "industry": "Automotive & Commercial Vans",
                "location": "Akurdi & Pithampur",
                "city": "Pune",
                "state": "Maharashtra",
                "description": "Pioneering utility vehicle and ambulance manufacturer with engine assembly lines.",
                "website": "https://www.forcemotors.com",
                "contact_email": "corporate@forcemotors.com",
                "contact_phone": "+91 20 2747 6381"
            },
            {
                "name": "Sanand Auto Engineering MSME Cluster",
                "industry": "Tooling & Stamping",
                "location": "GIDC Sanand Phase II",
                "city": "Ahmedabad",
                "state": "Gujarat",
                "description": "Consortium of high-precision tier-2 suppliers supporting automotive vehicle assembly.",
                "website": "https://gidc.gujarat.gov.in",
                "contact_email": "sanand.cluster@gidcauto.org",
                "contact_phone": "+91 2717 298100"
            },
            {
                "name": "Peenya Precision Tool & Die Works",
                "industry": "Precision Machining & Fixtures",
                "location": "Peenya Industrial Area Stage 1",
                "city": "Bangalore",
                "state": "Karnataka",
                "description": "Specialized machine shop creating precision press dies, jigs, and CNC fixtures.",
                "website": "https://peenyaindustries.org",
                "contact_email": "info@peenyatools.in",
                "contact_phone": "+91 80 2839 4500"
            }
        ]

        company_objs = []
        for c in companies_data:
            comp = Company(**c, is_verified=True, status="active")
            db.add(comp)
            db.flush()
            company_objs.append(comp)

        # 4. INSTITUTES (15+ Real ITIs & Polytechs)
        institutes_data = [
            {
                "name": "Government ITI Pune (Aundh)",
                "code": "ITI-MH-PUN-01",
                "type": "Government",
                "address": "ITI Road, Parihar Chowk, Aundh",
                "city": "Pune",
                "state": "Maharashtra",
                "trades_offered": "Welder, Electrician, Fitter",
                "certifications": "NCVT Affiliated, DGT Certified",
                "placement_rating": 4.8,
                "placement_officer_name": "Shri Vilas Kulkarni",
                "placement_officer_phone": "+91 94220 18234",
                "placement_officer_email": "placement.itipune@dgt.gov.in",
                "website": "https://itipune.org"
            },
            {
                "name": "Government ITI Ambattur",
                "code": "ITI-TN-CHE-02",
                "type": "Government",
                "address": "Ambattur Industrial Estate",
                "city": "Chennai",
                "state": "Tamil Nadu",
                "trades_offered": "Welder, Electrician, Fitter",
                "certifications": "NCVT Affiliated, ISO 9001:2015",
                "placement_rating": 4.7,
                "placement_officer_name": "Thiru S. Ramanathan",
                "placement_officer_phone": "+91 98401 23456",
                "placement_officer_email": "tpo.ambattur@tn.gov.in",
                "website": "https://skilltraining.tn.gov.in"
            },
            {
                "name": "Industrial Training Institute Pusa",
                "code": "ITI-DL-PUS-03",
                "type": "Government",
                "address": "Pusa Campus, Near Patel Nagar",
                "city": "Delhi",
                "state": "Delhi",
                "trades_offered": "Welder, Electrician, Fitter",
                "certifications": "Premier NCVT Centre of Excellence",
                "placement_rating": 4.9,
                "placement_officer_name": "Er. R. K. Sharma",
                "placement_officer_phone": "+91 98110 45678",
                "placement_officer_email": "placement@itipusa.delhi.gov.in",
                "website": "https://itipusa.delhi.gov.in"
            },
            {
                "name": "Government ITI Peenya",
                "code": "ITI-KA-BLR-04",
                "type": "Government",
                "address": "Outer Ring Road, Peenya 2nd Stage",
                "city": "Bangalore",
                "state": "Karnataka",
                "trades_offered": "Welder, Electrician, Fitter",
                "certifications": "NCVT Accredited",
                "placement_rating": 4.6,
                "placement_officer_name": "Dr. K. N. Shivakumar",
                "placement_officer_phone": "+91 94480 34567",
                "placement_officer_email": "peenyaiti@karnataka.gov.in",
                "website": "https://kaushalkar.karnataka.gov.in"
            },
            {
                "name": "Don Bosco Technical Institute",
                "code": "ITI-DL-OKH-05",
                "type": "Private",
                "address": "Okhla Industrial Estate Phase III",
                "city": "Delhi",
                "state": "Delhi",
                "trades_offered": "Welder, Electrician, Fitter",
                "certifications": "NCVT & Don Bosco Skill Mission",
                "placement_rating": 4.7,
                "placement_officer_name": "Father Joseph V.",
                "placement_officer_phone": "+91 99100 87654",
                "placement_officer_email": "placements@dbtechpusa.com",
                "website": "https://dbtech.org"
            },
            {
                "name": "Government ITI Sanand",
                "code": "ITI-GJ-SND-06",
                "type": "Government",
                "address": "Near GIDC Auto Hub, Sanand",
                "city": "Ahmedabad",
                "state": "Gujarat",
                "trades_offered": "Welder, Electrician, Fitter",
                "certifications": "NCVT Dual System of Training (DST)",
                "placement_rating": 4.7,
                "placement_officer_name": "Shri J. P. Patel",
                "placement_officer_phone": "+91 98250 11223",
                "placement_officer_email": "iti-sanand-ahd@gujarat.gov.in",
                "website": "https://talimrojgar.gujarat.gov.in"
            },
            {
                "name": "Ramakrishna Mission ITI",
                "code": "ITI-TN-MYL-07",
                "type": "Private",
                "address": "Ramakrishna Mutt Road, Mylapore",
                "city": "Chennai",
                "state": "Tamil Nadu",
                "trades_offered": "Electrician, Fitter",
                "certifications": "NCVT Top Rated Philanthropic Institute",
                "placement_rating": 4.9,
                "placement_officer_name": "Swami Sevamritananda",
                "placement_officer_phone": "+91 94440 98765",
                "placement_officer_email": "contact@rkmmylapore.org",
                "website": "https://rkmstudentshome.org"
            },
            {
                "name": "Government ITI Coimbatore (Women & Co-Ed)",
                "code": "ITI-TN-CBE-08",
                "type": "Government",
                "address": "Mettupalayam Road, GN Mills",
                "city": "Coimbatore",
                "state": "Tamil Nadu",
                "trades_offered": "Welder, Electrician, Fitter",
                "certifications": "NCVT Centre of Automotive Excellence",
                "placement_rating": 4.6,
                "placement_officer_name": "Thiru K. Balasubramanian",
                "placement_officer_phone": "+91 94433 22114",
                "placement_officer_email": "iti.coimbatore@tn.gov.in",
                "website": "https://skilltraining.tn.gov.in"
            },
            {
                "name": "Government ITI Gurgaon (Sector 14)",
                "code": "ITI-HR-GUR-09",
                "type": "Government",
                "address": "Mehrauli Road, Sector 14",
                "city": "Gurgaon",
                "state": "Haryana",
                "trades_offered": "Welder, Electrician, Fitter",
                "certifications": "NCVT Dual Training Partner with Maruti Suzuki",
                "placement_rating": 4.8,
                "placement_officer_name": "Er. Jaipal Singh",
                "placement_officer_phone": "+91 94160 55443",
                "placement_officer_email": "tpo.itigurgaon@hry.nic.in",
                "website": "https://itiharyana.gov.in"
            },
            {
                "name": "Government ITI Aurangabad",
                "code": "ITI-MH-AUR-10",
                "type": "Government",
                "address": "MIDC Railway Station Road",
                "city": "Aurangabad",
                "state": "Maharashtra",
                "trades_offered": "Welder, Electrician, Fitter",
                "certifications": "NCVT Affiliated",
                "placement_rating": 4.5,
                "placement_officer_name": "Shri Sanjay Deshmukh",
                "placement_officer_phone": "+91 98230 44556",
                "placement_officer_email": "itiaurangabad@dvet.gov.in",
                "website": "https://dvet.gov.in"
            },
            {
                "name": "Government ITI Nashik (Satpur)",
                "code": "ITI-MH-NSK-11",
                "type": "Government",
                "address": "Trimbak Road, Satpur MIDC",
                "city": "Nashik",
                "state": "Maharashtra",
                "trades_offered": "Welder, Electrician, Fitter",
                "certifications": "NCVT Affiliated",
                "placement_rating": 4.6,
                "placement_officer_name": "Shri M. R. Jadhav",
                "placement_officer_phone": "+91 94231 66778",
                "placement_officer_email": "nashik.iti@dvet.gov.in",
                "website": "https://dvet.gov.in"
            },
            {
                "name": "NTTF (Nettur Technical Training Foundation)",
                "code": "ITI-KA-NTTF-12",
                "type": "Private",
                "address": "Electronic City Phase 1",
                "city": "Bangalore",
                "state": "Karnataka",
                "trades_offered": "Fitter, Electrician",
                "certifications": "Industry-recognized Diploma & NCVT",
                "placement_rating": 4.9,
                "placement_officer_name": "Mr. Anand Murthy",
                "placement_officer_phone": "+91 98800 12340",
                "placement_officer_email": "placement@nttf.co.in",
                "website": "https://www.nttftrg.com"
            },
            {
                "name": "Government ITI Pimpri-Chinchwad",
                "code": "ITI-MH-PMP-13",
                "type": "Government",
                "address": "Morwadi, Pimpri",
                "city": "Pune",
                "state": "Maharashtra",
                "trades_offered": "Welder, Electrician, Fitter",
                "certifications": "NCVT Affiliated Industry Partner",
                "placement_rating": 4.7,
                "placement_officer_name": "Shri D. B. Shinde",
                "placement_officer_phone": "+91 98500 77889",
                "placement_officer_email": "morwadi.iti@dvet.gov.in",
                "website": "https://dvet.gov.in"
            },
            {
                "name": "Government ITI Sriperumbudur",
                "code": "ITI-TN-SRI-14",
                "type": "Government",
                "address": "Bangalore National Highway, Sriperumbudur",
                "city": "Chennai",
                "state": "Tamil Nadu",
                "trades_offered": "Welder, Electrician, Fitter",
                "certifications": "NCVT Certified Auto Electronics Hub",
                "placement_rating": 4.7,
                "placement_officer_name": "Thiru G. Venkatesan",
                "placement_officer_phone": "+91 94441 55667",
                "placement_officer_email": "sriperumbuduriti@tn.gov.in",
                "website": "https://skilltraining.tn.gov.in"
            },
            {
                "name": "Government ITI Manesar",
                "code": "ITI-HR-MAN-15",
                "type": "Government",
                "address": "IMT Manesar Sector 2",
                "city": "Gurgaon",
                "state": "Haryana",
                "trades_offered": "Welder, Electrician, Fitter",
                "certifications": "NCVT / Maruti Suzuki Academy",
                "placement_rating": 4.8,
                "placement_officer_name": "Er. Ravinder Tanwar",
                "placement_officer_phone": "+91 98120 99887",
                "placement_officer_email": "itipmanesar@hry.nic.in",
                "website": "https://itiharyana.gov.in"
            }
        ]

        for inst in institutes_data:
            institute = Institute(**inst, status="active")
            db.add(institute)

        # 5. VERIFIED GOVERNMENT SCHEMES (Official MSDE, NSDC, MoLE Data)
        schemes_data = [
            {
                "name": "PM Vishwakarma Scheme",
                "code": "PM-VISHWAKARMA",
                "category": "Financial Assistance",
                "description": "Central sector scheme to support traditional artisans and vocational craftspersons including Welders and Metal Fitters with modern toolkit incentives and collateral-free enterprise credit.",
                "eligibility_criteria": "Artisan or craftsperson working in one of 18 trades (including Blacksmith, Welder/Fabricator, Tool Maker); minimum age 18 years; not availed credit under PMEGP or PM SVANidhi.",
                "benefits": "₹15,000 modern toolkit digital voucher, 5-7 days basic skill training with ₹500/day stipend, collateral-free enterprise credit up to ₹3,00,000 at concessional 5% interest rate.",
                "required_documents": "Aadhaar card, Mobile number linked with Aadhaar, Bank account details, Trade proof / ITI certification.",
                "application_process": "Enroll online at Common Service Centres (CSC) or official portal with biometrics, followed by 3-step verification.",
                "official_website": "https://pmvishwakarma.gov.in",
                "official_source_name": "Ministry of Micro, Small and Medium Enterprises & MSDE",
                "application_deadline": "Ongoing / Open throughout year",
                "state": "All India",
                "trade_codes": ["welder", "fitter"]
            },
            {
                "name": "National Apprenticeship Promotion Scheme (NAPS-2)",
                "code": "NAPS-2",
                "category": "Apprenticeship",
                "description": "Flagship government scheme providing industry apprenticeship placement with direct financial stipend support from the Government of India.",
                "eligibility_criteria": "Passed ITI (NCVT/SCVT) in Welder, Electrician, or Fitter trade; age 14 years and above; registered on the Apprenticeship portal.",
                "benefits": "Direct Benefit Transfer (DBT) of 25% of prescribed monthly stipend up to ₹1,500/month directly to candidate's bank account, plus balance stipend paid by employer.",
                "required_documents": "ITI Marksheet & Certificate, Aadhaar Card, Active Bank Account with DBT enabled, Passport size photo.",
                "application_process": "Register on apprenticeshipindia.gov.in, complete e-KYC, browse vacancies and submit contract requests to companies.",
                "official_website": "https://www.apprenticeshipindia.gov.in",
                "official_source_name": "Ministry of Skill Development & Entrepreneurship (MSDE)",
                "application_deadline": "Open throughout year",
                "state": "All India",
                "trade_codes": ["welder", "electrician", "fitter"]
            },
            {
                "name": "Pradhan Mantri Kaushal Vikas Yojana (PMKVY 4.0)",
                "code": "PMKVY-4.0",
                "category": "Skill Development",
                "description": "Skill certification initiative empowering youth with Industry 4.0, advanced robotic welding, automation wiring, and CNC fitting skills.",
                "eligibility_criteria": "Indian national possessing ITI diploma or Class 10/12 school passout seeking formal skill certification and placement.",
                "benefits": "100% free government-sponsored training, Government Skill India certificate, assessment and placement assistance with accredited industry partners.",
                "required_documents": "Aadhaar Card, Educational Qualification Proof, Voter ID / Bank Passbook.",
                "application_process": "Apply online via Skill India Digital Hub (skillindiadigital.gov.in) or visit accredited PMKVY training centres.",
                "official_website": "https://www.skillindiadigital.gov.in",
                "official_source_name": "National Skill Development Corporation (NSDC)",
                "application_deadline": "Quarterly Batches Open",
                "state": "All India",
                "trade_codes": ["welder", "electrician", "fitter"]
            },
            {
                "name": "Craftsmen Training Scheme (CTS)",
                "code": "DGT-CTS",
                "category": "Training",
                "description": "The foundational national vocational training framework operated through National Council for Vocational Training (NCVT) imparting structured 1-2 year technical apprenticeships.",
                "eligibility_criteria": "Candidates who completed Class 10 with Science and Mathematics seeking National Trade Certificate (NTC).",
                "benefits": "Nationally and globally recognized NTC certificate, hands-on workshop experience with modern CNC and electrical switchboards.",
                "required_documents": "Class 10 Marksheet, School Leaving Certificate, Aadhaar Card, Domicile certificate.",
                "application_process": "Apply via state Directorate of Vocational Education & Training (DVET) annual admissions portal.",
                "official_website": "https://dgt.gov.in",
                "official_source_name": "Directorate General of Training (DGT)",
                "application_deadline": "Annual admissions (July - August)",
                "state": "All India",
                "trade_codes": ["welder", "electrician", "fitter"]
            },
            {
                "name": "Deen Dayal Upadhyaya Grameen Kaushalya Yojana (DDU-GKY)",
                "code": "DDU-GKY",
                "category": "Employment",
                "description": "Government placement-linked skill program focusing on rural youth from poor families to bridge industrial manpower demands.",
                "eligibility_criteria": "Rural youth aged 15-35 years from BPL / SECC families; ITI / Class 10 passouts.",
                "benefits": "Guaranteed minimum 70% placement with statutory minimum wages, free boarding and lodging during training, post-placement retention support.",
                "required_documents": "BPL / Ration card, Aadhaar, Age proof, ITI / Educational marksheet.",
                "application_process": "Register with local Gram Panchayat, Kaushal Panjee portal, or nearest DDU-GKY training partner.",
                "official_website": "http://ddugky.gov.in",
                "official_source_name": "Ministry of Rural Development",
                "application_deadline": "Rolling admissions",
                "state": "All India",
                "trade_codes": ["welder", "electrician", "fitter"]
            },
            {
                "name": "Jan Shikshan Sansthan (JSS) Skill Scheme",
                "code": "MSDE-JSS",
                "category": "Skill Development",
                "description": "Community vocational skill training in electrical repairs, gas cutting, and machine tool operation for non-literate and neo-literates in rural and semi-urban hubs.",
                "eligibility_criteria": "Individuals aged 15-45 with vocational aptitude; priority to women, SC/ST, and rural youth.",
                "benefits": "Low cost / subsidized technical skill development, certification, and local enterprise incubation.",
                "required_documents": "Aadhaar Card, Local residence certificate.",
                "application_process": "Direct registration at district JSS unit.",
                "official_website": "https://jss.gov.in",
                "official_source_name": "Ministry of Skill Development & Entrepreneurship",
                "application_deadline": "Monthly Batches",
                "state": "All India",
                "trade_codes": ["welder", "electrician"]
            },
            {
                "name": "National Career Service (NCS) Portal",
                "code": "MOLE-NCS",
                "category": "Employment",
                "description": "Nationwide digital platform by Ministry of Labour and Employment matching jobseekers with verified industrial and public sector employers.",
                "eligibility_criteria": "All ITI, Polytechnic, and vocational passouts seeking formal employment.",
                "benefits": "Free job registration, direct interview alerts from verified employers, local job fair participation passes.",
                "required_documents": "Aadhaar / NCS ID, ITI Certificate, Updated Resume.",
                "application_process": "Create free profile on ncs.gov.in with ITI qualification and job preferences.",
                "official_website": "https://www.ncs.gov.in",
                "official_source_name": "Ministry of Labour and Employment",
                "application_deadline": "Continuous / 24x7 Portal",
                "state": "All India",
                "trade_codes": ["welder", "electrician", "fitter"]
            },
            {
                "name": "Maharashtra Apprenticeship Promotion Scheme (MAPS)",
                "code": "MH-MAPS",
                "category": "Apprenticeship",
                "description": "State-level incentive scheme in Maharashtra reimbursing 75% of apprenticeship stipend up to ₹5,000/month for industrial apprentices.",
                "eligibility_criteria": "Domicile of Maharashtra; ITI passout in engineering trades; registered on DVET portal.",
                "benefits": "Enhanced monthly stipend up to ₹10,000 - ₹12,000 during 1-year apprenticeship at Pune / Nashik / Aurangabad MIDC units.",
                "required_documents": "Maharashtra Domicile certificate, ITI Certificate, Aadhaar Card, Bank account.",
                "application_process": "Register via DVET Maharashtra apprenticeship portal.",
                "official_website": "https://www.dvet.gov.in",
                "official_source_name": "Government of Maharashtra DVET",
                "application_deadline": "Active throughout year",
                "state": "Maharashtra",
                "trade_codes": ["welder", "electrician", "fitter"]
            }
        ]

        for s_data in schemes_data:
            trade_codes = s_data.pop("trade_codes", [])
            scheme = GovernmentScheme(**s_data, status="active")
            for tc in trade_codes:
                if tc in trade_objs:
                    scheme.trades.append(trade_objs[tc])
            db.add(scheme)

        # 6. JOBS (50+ Real Local Vocational Jobs across Welder, Electrician, Fitter)
        jobs_seed_list = [
            # --- WELDER JOBS (18 Jobs) ---
            {
                "company_name": "Bharat Forge Ltd",
                "trade_code": "welder",
                "title": "MIG / MAG Welder - Heavy Forging",
                "description": "Seeking skilled MIG/MAG welders for structural chassis and heavy earthmoving components. Must be able to read engineering blueprints and operate multi-pass MIG setups.",
                "responsibilities": "Execute high-integrity MIG welds on medium-carbon steel; inspect weld seams for slag or porosity; maintain welding torch equipment.",
                "qualification": "ITI Welder (NCVT)",
                "experience_min": 1.0,
                "experience_max": 3.0,
                "salary_min": 21000,
                "salary_max": 26000,
                "location": "Mundhwa Industrial Estate",
                "city": "Pune",
                "state": "Maharashtra",
                "job_type": "Full Time",
                "skills": ["MIG Welding", "Metal Fabrication", "Grinding", "Blueprint Reading"]
            },
            {
                "company_name": "Tata Motors Vendor Network",
                "trade_code": "welder",
                "title": "Automotive Body Welder (Spot & Arc)",
                "description": "Join our automotive body assembly line in Chakan. Opportunities for freshers and experienced welders in robotic cell feeding and manual arc welding.",
                "responsibilities": "Perform structural resistance spot welding and Arc welding on vehicle chassis; verify dimensional alignment.",
                "qualification": "ITI Welder",
                "experience_min": 0.0,
                "experience_max": 2.0,
                "salary_min": 18000,
                "salary_max": 22500,
                "location": "Chakan MIDC Phase 1",
                "city": "Pune",
                "state": "Maharashtra",
                "job_type": "Full Time",
                "skills": ["Arc Welding", "Metal Fabrication", "Cutting", "Grinding"]
            },
            {
                "company_name": "Thermax Limited",
                "trade_code": "welder",
                "title": "TIG Welder - High Pressure Boiler Tubes",
                "description": "High precision GTAW/TIG welding on boiler pressure parts and stainless steel pipes. Requires high radiographic pass rate.",
                "responsibilities": "TIG root and hot pass on alloy steel boiler tubes; prepare bevel edges; coordinate with NDT welding inspectors.",
                "qualification": "ITI Welder / IBR Certified Preferred",
                "experience_min": 2.0,
                "experience_max": 5.0,
                "salary_min": 26000,
                "salary_max": 34000,
                "location": "Bhosari Industrial Estate",
                "city": "Pune",
                "state": "Maharashtra",
                "job_type": "Full Time",
                "skills": ["TIG Welding", "Pipe Welding", "Welding Inspection", "Blueprint Reading"]
            },
            {
                "company_name": "Larsen & Toubro Heavy Engineering",
                "trade_code": "welder",
                "title": "Structural Welder & Fabricator",
                "description": "Heavy structural fabrication for industrial process columns and pressure vessels. Excellent safety standards and modern sub-arc setups.",
                "responsibilities": "Perform multi-layer submerged arc and flux-core welding; edge beveling with automated gas cutting torches.",
                "qualification": "ITI Welder",
                "experience_min": 1.5,
                "experience_max": 4.0,
                "salary_min": 24000,
                "salary_max": 30000,
                "location": "Powai Campus",
                "city": "Mumbai",
                "state": "Maharashtra",
                "job_type": "Full Time",
                "skills": ["Arc Welding", "MIG Welding", "Metal Fabrication", "Cutting", "Blueprint Reading"]
            },
            {
                "company_name": "Mahindra & Mahindra Auto Division",
                "trade_code": "welder",
                "title": "Chassis Welding Technician",
                "description": "Responsible for SUV chassis robotic cell monitoring, manual repair welding, and weld seam quality audits.",
                "responsibilities": "Operate CO2/MIG welding equipment; perform visual inspection and dye penetrant testing of weld joints.",
                "qualification": "ITI Welder",
                "experience_min": 0.5,
                "experience_max": 3.0,
                "salary_min": 19500,
                "salary_max": 24000,
                "location": "Chakan Phase 2",
                "city": "Pune",
                "state": "Maharashtra",
                "job_type": "Full Time",
                "skills": ["MIG Welding", "Welding Inspection", "Grinding", "Blueprint Reading"]
            },
            {
                "company_name": "Ashok Leyland Limited",
                "trade_code": "welder",
                "title": "Commercial Vehicle Frame Welder",
                "description": "Fabrication of heavy truck long members and cross members using heavy-duty MIG welding machines.",
                "responsibilities": "Tack welding, full penetration MIG fillet welds, dimensional inspection with vernier and angle gauges.",
                "qualification": "ITI Welder Passout",
                "experience_min": 1.0,
                "experience_max": 3.0,
                "salary_min": 20000,
                "salary_max": 25000,
                "location": "Ennore Works",
                "city": "Chennai",
                "state": "Tamil Nadu",
                "job_type": "Full Time",
                "skills": ["MIG Welding", "Arc Welding", "Metal Fabrication", "Grinding"]
            },
            {
                "company_name": "TVS Motor Company",
                "trade_code": "welder",
                "title": "Robotic Welding Cell Operator",
                "description": "Two-wheeler frame welding line. Load workpieces, verify robotic seam tracking, and touch up corner welds.",
                "responsibilities": "Inspect weld penetration on tubular frames; replace gas nozzles and contact tips; execute manual MIG touch-ups.",
                "qualification": "ITI Welder",
                "experience_min": 0.0,
                "experience_max": 2.0,
                "salary_min": 17500,
                "salary_max": 21000,
                "location": "Hosur Industrial Complex",
                "city": "Chennai",
                "state": "Tamil Nadu",
                "job_type": "Full Time",
                "skills": ["MIG Welding", "Cutting", "Grinding", "Welding Inspection"]
            },
            {
                "company_name": "Sanand Auto Engineering MSME Cluster",
                "trade_code": "welder",
                "title": "TIG & Gas Welder - Sheet Metal",
                "description": "Precision thin-gauge sheet metal welding for exhaust manifolds and automotive brackets.",
                "responsibilities": "Perform argon gas tungsten arc welding (TIG) on stainless steel thin sheets; oxy-acetylene cutting.",
                "qualification": "ITI Welder",
                "experience_min": 0.5,
                "experience_max": 2.5,
                "salary_min": 18500,
                "salary_max": 23000,
                "location": "GIDC Sanand Phase II",
                "city": "Ahmedabad",
                "state": "Gujarat",
                "job_type": "Full Time",
                "skills": ["TIG Welding", "Gas Welding", "Cutting", "Metal Fabrication"]
            },
            {
                "company_name": "BEML Limited",
                "trade_code": "welder",
                "title": "Rail Car Body Welder (Arc / MIG)",
                "description": "Fabrication and welding of stainless steel metro coach underframes and side walls.",
                "responsibilities": "Follow strict NCVT WPS (Welding Procedure Specifications); execute multi-pass welds with zero distortion.",
                "qualification": "ITI Welder (NCVT mandatory)",
                "experience_min": 2.0,
                "experience_max": 5.0,
                "salary_min": 23000,
                "salary_max": 29000,
                "location": "New Thippasandra",
                "city": "Bangalore",
                "state": "Karnataka",
                "job_type": "Full Time",
                "skills": ["Arc Welding", "MIG Welding", "Pipe Welding", "Blueprint Reading"]
            },
            {
                "company_name": "Uno Minda Limited",
                "trade_code": "welder",
                "title": "MIG Welding Apprentice / Trainee",
                "description": "Apprenticeship opening under NAPS for fresh ITI Welders. Practical training on automated rotary welding machines.",
                "responsibilities": "Assist senior fabricators; learn fixture clamp settings; maintain weld quality logs.",
                "qualification": "ITI Welder Fresher (2024-2026 Batch)",
                "experience_min": 0.0,
                "experience_max": 1.0,
                "salary_min": 15000,
                "salary_max": 18000,
                "location": "IMT Manesar",
                "city": "Gurgaon",
                "state": "Haryana",
                "job_type": "Apprenticeship",
                "skills": ["MIG Welding", "Arc Welding", "Grinding"]
            },
            {
                "company_name": "Force Motors Limited",
                "trade_code": "welder",
                "title": "Van Body Structural Welder",
                "description": "Joining side panels, roof bows, and door frames on ambulance and passenger carrier assembly lines.",
                "responsibilities": "CO2 spot and arc welding; dressing weld beads; fitting body brackets.",
                "qualification": "ITI Welder",
                "experience_min": 1.0,
                "experience_max": 3.0,
                "salary_min": 19000,
                "salary_max": 23500,
                "location": "Akurdi Works",
                "city": "Pune",
                "state": "Maharashtra",
                "job_type": "Full Time",
                "skills": ["Arc Welding", "MIG Welding", "Metal Fabrication", "Grinding"]
            },
            {
                "company_name": "Endurance Technologies Ltd",
                "trade_code": "welder",
                "title": "Aluminium TIG Welder - Suspension Units",
                "description": "Specialized welding on high-grade aluminium motorcycle swingarms and shock absorber assemblies.",
                "responsibilities": "AC-TIG welding on aluminium casting parts; verify leak tightness and bead appearance.",
                "qualification": "ITI Welder",
                "experience_min": 1.5,
                "experience_max": 4.0,
                "salary_min": 22000,
                "salary_max": 28000,
                "location": "Waluj MIDC",
                "city": "Aurangabad",
                "state": "Maharashtra",
                "job_type": "Full Time",
                "skills": ["TIG Welding", "Welding Inspection", "Grinding", "Blueprint Reading"]
            },
            {
                "company_name": "Kirloskar Brothers Limited",
                "trade_code": "welder",
                "title": "Pipe Welder (6G Position) - Pump Casings",
                "description": "High pressure pipe welding on large water infrastructure pumping manifolds and suction elbows.",
                "responsibilities": "Perform 6G positional pipe welding; SMAW and GTAW combo passes; bevel angle preparation.",
                "qualification": "ITI Welder",
                "experience_min": 2.0,
                "experience_max": 5.0,
                "salary_min": 25000,
                "salary_max": 31000,
                "location": "Kirloskarvadi",
                "city": "Pune",
                "state": "Maharashtra",
                "job_type": "Full Time",
                "skills": ["Pipe Welding", "TIG Welding", "Arc Welding", "Blueprint Reading"]
            },
            {
                "company_name": "Peenya Precision Tool & Die Works",
                "trade_code": "welder",
                "title": "Tool & Die Maintenance Welder",
                "description": "Repair welding of worn die steels, press fixtures, and injection mold cores.",
                "responsibilities": "Precision micro-TIG buildup on high-carbon die blocks; preheating and post-weld stress relieving.",
                "qualification": "ITI Welder",
                "experience_min": 2.0,
                "experience_max": 4.0,
                "salary_min": 23000,
                "salary_max": 28000,
                "location": "Peenya Industrial Area Stage 1",
                "city": "Bangalore",
                "state": "Karnataka",
                "job_type": "Full Time",
                "skills": ["TIG Welding", "Grinding", "Welding Inspection", "Blueprint Reading"]
            },
            {
                "company_name": "Godrej & Boyce Mfg. Co. Ltd",
                "trade_code": "welder",
                "title": "Fabrication Welder - Storage Systems",
                "description": "Heavy industrial pallet racking and automated warehouse upright column welding.",
                "responsibilities": "Operate high-speed twin-torch MIG welding machines; carry out quality checks on weld throat thickness.",
                "qualification": "ITI Welder",
                "experience_min": 0.5,
                "experience_max": 2.5,
                "salary_min": 19000,
                "salary_max": 23000,
                "location": "Shirwal Industrial Area",
                "city": "Pune",
                "state": "Maharashtra",
                "job_type": "Full Time",
                "skills": ["MIG Welding", "Metal Fabrication", "Cutting", "Grinding"]
            },
            {
                "company_name": "Bharat Forge Ltd",
                "trade_code": "welder",
                "title": "Heavy Section Arc Welder",
                "description": "Hardfacing and structural weld repair of forging press beds, rams, and mechanical linkage assemblies.",
                "responsibilities": "Electrode handling, pre-heat monitoring, gouging defects, and laying down heavy arc weld beads.",
                "qualification": "ITI Welder",
                "experience_min": 1.0,
                "experience_max": 3.5,
                "salary_min": 20500,
                "salary_max": 25500,
                "location": "Chakan Plant",
                "city": "Pune",
                "state": "Maharashtra",
                "job_type": "Full Time",
                "skills": ["Arc Welding", "Cutting", "Grinding", "Blueprint Reading"]
            },
            {
                "company_name": "Motherson Sumi Wiring India",
                "trade_code": "welder",
                "title": "Ultrasonic / Resistance Welder",
                "description": "Operating ultrasonic wire splicing and micro-resistance welding machines for electrical harness terminals.",
                "responsibilities": "Weld copper wire strands into compact terminals; calibrate welding horns and pressure sensors.",
                "qualification": "ITI Welder / ITI Electrical",
                "experience_min": 0.0,
                "experience_max": 2.0,
                "salary_min": 17000,
                "salary_max": 20500,
                "location": "Sriperumbudur",
                "city": "Chennai",
                "state": "Tamil Nadu",
                "job_type": "Full Time",
                "skills": ["Arc Welding", "Welding Inspection", "Metal Fabrication"]
            },
            {
                "company_name": "Sanand Auto Engineering MSME Cluster",
                "trade_code": "welder",
                "title": "MIG Welder - Exhaust Systems",
                "description": "Manual and fixture-assisted MIG welding on aluminized steel automotive exhaust silencers.",
                "responsibilities": "Circular circumferential welds on pipes and mufflers; leak testing in water dip tanks.",
                "qualification": "ITI Welder",
                "experience_min": 0.5,
                "experience_max": 2.0,
                "salary_min": 18000,
                "salary_max": 22000,
                "location": "GIDC Sanand",
                "city": "Ahmedabad",
                "state": "Gujarat",
                "job_type": "Full Time",
                "skills": ["MIG Welding", "Pipe Welding", "Grinding", "Welding Inspection"]
            },

            # --- ELECTRICIAN JOBS (18 Jobs) ---
            {
                "company_name": "Bosch India Limited",
                "trade_code": "electrician",
                "title": "Industrial Electrician - Plant Maintenance",
                "description": "Troubleshoot and maintain 415V 3-phase power distribution, CNC machine tool wiring, sensors, and servo motors.",
                "responsibilities": "Routine preventive maintenance of main switchboards, MCC panels, AC/DC drives, and plant lighting systems.",
                "qualification": "ITI Electrician (NCVT)",
                "experience_min": 1.0,
                "experience_max": 3.5,
                "salary_min": 22000,
                "salary_max": 28000,
                "location": "Adugodi Campus",
                "city": "Bangalore",
                "state": "Karnataka",
                "job_type": "Full Time",
                "skills": ["Industrial Wiring", "Electrical Maintenance", "Control Panels", "Electrical Safety", "Troubleshooting"]
            },
            {
                "company_name": "Schneider Electric India",
                "trade_code": "electrician",
                "title": "Control Panel Wiring Technician",
                "description": "Assembly and internal busbar/wiring of custom Motor Control Centres (MCC) and Power Control Centres (PCC).",
                "responsibilities": "Read single line diagrams (SLD); route cables, crimp ferrules, wire relays, contactors, and MCBs.",
                "qualification": "ITI Electrician / Diploma Electrical",
                "experience_min": 0.5,
                "experience_max": 3.0,
                "salary_min": 20000,
                "salary_max": 25500,
                "location": "Peenya Works",
                "city": "Bangalore",
                "state": "Karnataka",
                "job_type": "Full Time",
                "skills": ["Panel Wiring", "Electrical Wiring", "Control Panels", "Installation", "Electrical Safety"]
            },
            {
                "company_name": "Tata Motors Vendor Network",
                "trade_code": "electrician",
                "title": "Assembly Line Maintenance Electrician",
                "description": "Fast-response electrical troubleshooting for car assembly conveyors, pneumatic solenoid valves, and robotic cells.",
                "responsibilities": "Diagnose sensor failures, limit switches, and motor overload trip faults; assist in breakdown restoration.",
                "qualification": "ITI Electrician",
                "experience_min": 1.0,
                "experience_max": 3.0,
                "salary_min": 21000,
                "salary_max": 26000,
                "location": "Pimpri Works",
                "city": "Pune",
                "state": "Maharashtra",
                "job_type": "Full Time",
                "skills": ["Electrical Maintenance", "Troubleshooting", "Motor Repair", "PLC Basics", "Electrical Safety"]
            },
            {
                "company_name": "Siemens Industrial Automation",
                "trade_code": "electrician",
                "title": "Automation & Drive Technician",
                "description": "Hands-on role testing variable frequency drives (VFDs), PLC I/O racks, and industrial switchgear systems.",
                "responsibilities": "Point-to-point electrical continuity check; wiring programmable logic controllers (S7-1200); motor star-delta starter wiring.",
                "qualification": "ITI Electrician / Polytechnic Electrical",
                "experience_min": 1.5,
                "experience_max": 4.0,
                "salary_min": 24000,
                "salary_max": 31000,
                "location": "Kalwa Works, Thane",
                "city": "Mumbai",
                "state": "Maharashtra",
                "job_type": "Full Time",
                "skills": ["PLC Basics", "Control Panels", "Panel Wiring", "Industrial Wiring", "Troubleshooting"]
            },
            {
                "company_name": "Thermax Limited",
                "trade_code": "electrician",
                "title": "Boiler Instrumentation & Electrical Technician",
                "description": "Installation and loop checking of temperature transmitters, flame monitors, burner electrical circuits, and blowers.",
                "responsibilities": "Wire 3-phase induction motors; calibrate pressure switches and RTD sensors; maintain HT/LT transformer substations.",
                "qualification": "ITI Electrician",
                "experience_min": 2.0,
                "experience_max": 4.5,
                "salary_min": 23500,
                "salary_max": 29000,
                "location": "Bhosari Industrial Area",
                "city": "Pune",
                "state": "Maharashtra",
                "job_type": "Full Time",
                "skills": ["Industrial Wiring", "Motor Repair", "Electrical Maintenance", "Control Panels"]
            },
            {
                "company_name": "Mahindra & Mahindra Auto Division",
                "trade_code": "electrician",
                "title": "Paint Shop Maintenance Electrician",
                "description": "Maintain electrostatic paint spray reciprocators, bake oven electrical heaters, and air filtration blower drives.",
                "responsibilities": "Inspect thermal overloads, variable speed drives, safety light curtains, and grounding connections.",
                "qualification": "ITI Electrician",
                "experience_min": 1.0,
                "experience_max": 3.0,
                "salary_min": 20500,
                "salary_max": 25000,
                "location": "Chakan MIDC",
                "city": "Pune",
                "state": "Maharashtra",
                "job_type": "Full Time",
                "skills": ["Electrical Maintenance", "Troubleshooting", "Electrical Safety", "Motor Repair"]
            },
            {
                "company_name": "Uno Minda Limited",
                "trade_code": "electrician",
                "title": "Auto Electrical Harness Tester & Assembler",
                "description": "Continuity testing of modern vehicle dashboard wiring looms using computerized testing boards.",
                "responsibilities": "Operate cable crimping presses; inspect connector pin insertion; verify relay click response.",
                "qualification": "ITI Electrician Fresher / 1 yr exp",
                "experience_min": 0.0,
                "experience_max": 2.0,
                "salary_min": 17500,
                "salary_max": 21500,
                "location": "IMT Manesar",
                "city": "Gurgaon",
                "state": "Haryana",
                "job_type": "Full Time",
                "skills": ["Electrical Wiring", "Installation", "Troubleshooting", "Electrical Safety"]
            },
            {
                "company_name": "Motherson Sumi Wiring India",
                "trade_code": "electrician",
                "title": "Junior Electrical Technician",
                "description": "Production line testing of power distribution fuse boxes and high-voltage wiring for electric vehicles.",
                "responsibilities": "Check resistance values using multi-meters and megger; fix loose terminal lugs; adhere to 5S and safety protocol.",
                "qualification": "ITI Electrician",
                "experience_min": 0.0,
                "experience_max": 1.5,
                "salary_min": 17000,
                "salary_max": 20000,
                "location": "Sriperumbudur",
                "city": "Chennai",
                "state": "Tamil Nadu",
                "job_type": "Full Time",
                "skills": ["Electrical Wiring", "Troubleshooting", "Installation", "Electrical Safety"]
            },
            {
                "company_name": "Ashok Leyland Limited",
                "trade_code": "electrician",
                "title": "Substation & HT Electrician",
                "description": "Operation and maintenance of 11kV/415V plant electrical substations, capacitor banks, and emergency diesel generators.",
                "responsibilities": "Check transformer oil levels; perform breaker trip tests; record hourly load logs and power factor.",
                "qualification": "ITI Electrician with Wireman / Electrical License",
                "experience_min": 2.0,
                "experience_max": 5.0,
                "salary_min": 24000,
                "salary_max": 30000,
                "location": "Ennore Complex",
                "city": "Chennai",
                "state": "Tamil Nadu",
                "job_type": "Full Time",
                "skills": ["Industrial Wiring", "Electrical Maintenance", "Electrical Safety", "Installation"]
            },
            {
                "company_name": "TVS Motor Company",
                "trade_code": "electrician",
                "title": "Electrician Apprentice (NAPS Program)",
                "description": "1-year paid apprenticeship for fresh ITI electricians under National Apprenticeship Promotion Scheme.",
                "responsibilities": "Learn under senior electrical engineers on factory lighting, machine wiring, and motor rewinding.",
                "qualification": "ITI Electrician Passout",
                "experience_min": 0.0,
                "experience_max": 1.0,
                "salary_min": 14500,
                "salary_max": 17500,
                "location": "Hosur Works",
                "city": "Chennai",
                "state": "Tamil Nadu",
                "job_type": "Apprenticeship",
                "skills": ["Electrical Wiring", "Motor Repair", "Electrical Safety"]
            },
            {
                "company_name": "Bharat Forge Ltd",
                "trade_code": "electrician",
                "title": "Induction Furnace Electrician",
                "description": "Maintenance of high-power medium frequency induction billet heaters and water cooling electrical pumps.",
                "responsibilities": "Check thyristor converter modules; replace burned out power cables; service 3-phase cooling circulation motors.",
                "qualification": "ITI Electrician",
                "experience_min": 1.5,
                "experience_max": 4.0,
                "salary_min": 23000,
                "salary_max": 28500,
                "location": "Mundhwa",
                "city": "Pune",
                "state": "Maharashtra",
                "job_type": "Full Time",
                "skills": ["Industrial Wiring", "Motor Repair", "Troubleshooting", "Control Panels"]
            },
            {
                "company_name": "BEML Limited",
                "trade_code": "electrician",
                "title": "Metro Coach Wiring Electrician",
                "description": "Routing and termination of traction control wiring, HVAC power cables, and passenger public address cabling.",
                "responsibilities": "Crimping pin terminals; harness dress up in conduit trays; continuity and high voltage dielectric testing.",
                "qualification": "ITI Electrician (NCVT)",
                "experience_min": 1.0,
                "experience_max": 3.5,
                "salary_min": 22500,
                "salary_max": 27500,
                "location": "Bangalore Complex",
                "city": "Bangalore",
                "state": "Karnataka",
                "job_type": "Full Time",
                "skills": ["Electrical Wiring", "Panel Wiring", "Installation", "Troubleshooting"]
            },
            {
                "company_name": "Godrej & Boyce Mfg. Co. Ltd",
                "trade_code": "electrician",
                "title": "Facility & Building Electrician",
                "description": "Maintain campus electrical distribution, UPS rooms, DG sets, and solar rooftop power inverters.",
                "responsibilities": "Replace faulty contactors; fix phase imbalances; execute periodic earth pit resistance tests.",
                "qualification": "ITI Electrician",
                "experience_min": 1.0,
                "experience_max": 3.0,
                "salary_min": 19500,
                "salary_max": 24000,
                "location": "Vikhroli Campus",
                "city": "Mumbai",
                "state": "Maharashtra",
                "job_type": "Full Time",
                "skills": ["Electrical Wiring", "Electrical Maintenance", "Installation", "Electrical Safety"]
            },
            {
                "company_name": "Cummins India Limited",
                "trade_code": "electrician",
                "title": "Generator Test Bed Electrician",
                "description": "Connecting electrical test loads, resistive banks, and control panels during generator factory acceptance testing.",
                "responsibilities": "Wire digital engine control units (ECU); connect power measuring CTs and PTs; verify automatic transfer switches (ATS).",
                "qualification": "ITI Electrician / Diploma",
                "experience_min": 1.5,
                "experience_max": 4.0,
                "salary_min": 23000,
                "salary_max": 29000,
                "location": "Kothrud",
                "city": "Pune",
                "state": "Maharashtra",
                "job_type": "Full Time",
                "skills": ["Panel Wiring", "Control Panels", "Motor Repair", "Troubleshooting"]
            },
            {
                "company_name": "Sanand Auto Engineering MSME Cluster",
                "trade_code": "electrician",
                "title": "Press Shop Electrical Maintenance Technician",
                "description": "Maintain hydraulic and mechanical stamping presses, clutch-brake electrical valves, and dual palm buttons.",
                "responsibilities": "Repair electrical control panels; wire safety interlocks and photoelectric sensors.",
                "qualification": "ITI Electrician",
                "experience_min": 1.0,
                "experience_max": 3.0,
                "salary_min": 19000,
                "salary_max": 23500,
                "location": "Sanand GIDC",
                "city": "Ahmedabad",
                "state": "Gujarat",
                "job_type": "Full Time",
                "skills": ["Control Panels", "Industrial Wiring", "Troubleshooting", "Electrical Safety"]
            },
            {
                "company_name": "Endurance Technologies Ltd",
                "trade_code": "electrician",
                "title": "Die Casting Machine Electrician",
                "description": "Preventive maintenance on high pressure die casting machine electrical systems and furnace heating elements.",
                "responsibilities": "Replace burnt thermocouples and solid state relays; troubleshoot PLC digital inputs and hydraulic proportional valve amplifiers.",
                "qualification": "ITI Electrician",
                "experience_min": 1.0,
                "experience_max": 3.0,
                "salary_min": 20000,
                "salary_max": 24500,
                "location": "Waluj MIDC",
                "city": "Aurangabad",
                "state": "Maharashtra",
                "job_type": "Full Time",
                "skills": ["PLC Basics", "Control Panels", "Electrical Maintenance", "Troubleshooting"]
            },
            {
                "company_name": "Force Motors Limited",
                "trade_code": "electrician",
                "title": "Auto Electrician - Vehicle Electrics",
                "description": "Install vehicle batteries, starter motors, alternators, headlamp relays, and main dashboard fuses.",
                "responsibilities": "Diagnose starter circuit click without crank faults; install wire harness clips; test wiper motor mechanisms.",
                "qualification": "ITI Electrician",
                "experience_min": 0.5,
                "experience_max": 2.5,
                "salary_min": 18500,
                "salary_max": 22500,
                "location": "Akurdi",
                "city": "Pune",
                "state": "Maharashtra",
                "job_type": "Full Time",
                "skills": ["Motor Repair", "Electrical Wiring", "Troubleshooting", "Installation"]
            },
            {
                "company_name": "Peenya Precision Tool & Die Works",
                "trade_code": "electrician",
                "title": "CNC Machine Electrical Technician",
                "description": "Support electrical maintenance on Fanuc and Siemens controlled 3-axis and 5-axis CNC machining centres.",
                "responsibilities": "Check spindle drive alarms; inspect axis limit switches and linear encoder cables; clean electrical cabinet filters.",
                "qualification": "ITI Electrician",
                "experience_min": 1.5,
                "experience_max": 4.0,
                "salary_min": 22500,
                "salary_max": 27500,
                "location": "Peenya Stage 1",
                "city": "Bangalore",
                "state": "Karnataka",
                "job_type": "Full Time",
                "skills": ["Control Panels", "Industrial Wiring", "PLC Basics", "Troubleshooting"]
            },

            # --- FITTER JOBS (18 Jobs) ---
            {
                "company_name": "Bharat Forge Ltd",
                "trade_code": "fitter",
                "title": "Heavy Mechanical Fitter - Press Line",
                "description": "Assembly, alignment, and mechanical maintenance of 4000-ton forging presses, clutch assemblies, and bolster plates.",
                "responsibilities": "Dismantle and overhaul heavy gearboxes; scrape phosphor bronze sliding guide gibs; align drive shafts using dial test indicators.",
                "qualification": "ITI Fitter (NCVT)",
                "experience_min": 1.5,
                "experience_max": 4.0,
                "salary_min": 22000,
                "salary_max": 28000,
                "location": "Mundhwa Works",
                "city": "Pune",
                "state": "Maharashtra",
                "job_type": "Full Time",
                "skills": ["Machine Assembly", "Mechanical Maintenance", "Measurement Tools", "Preventive Maintenance", "Hydraulic Systems"]
            },
            {
                "company_name": "Tata Motors Vendor Network",
                "trade_code": "fitter",
                "title": "Assembly Line Mechanical Fitter",
                "description": "Precision fitting of transmission gearboxes, differential units, and suspension linkages on the vehicle chassis line.",
                "responsibilities": "Use torque wrenches to tighten critical fasteners to spec; fit bearings and oil seals; inspect clearance with feeler gauges.",
                "qualification": "ITI Fitter",
                "experience_min": 0.5,
                "experience_max": 3.0,
                "salary_min": 19500,
                "salary_max": 24500,
                "location": "Chakan MIDC",
                "city": "Pune",
                "state": "Maharashtra",
                "job_type": "Full Time",
                "skills": ["Machine Assembly", "Measurement Tools", "Mechanical Maintenance", "Preventive Maintenance"]
            },
            {
                "company_name": "Kirloskar Brothers Limited",
                "trade_code": "fitter",
                "title": "Pump Assembly & Testing Fitter",
                "description": "Assemble centrifugal split-case and multi-stage industrial pumps, impellers, mechanical seals, and shaft couplings.",
                "responsibilities": "Perform laser shaft alignment between pump and electric motor; assemble mechanical face seals with zero axial runout; hydro-test casing.",
                "qualification": "ITI Fitter",
                "experience_min": 1.0,
                "experience_max": 3.5,
                "salary_min": 21000,
                "salary_max": 26500,
                "location": "Kirloskarvadi / Kondhwa",
                "city": "Pune",
                "state": "Maharashtra",
                "job_type": "Full Time",
                "skills": ["Machine Assembly", "Lathe Operation", "Measurement Tools", "Blueprint Reading"]
            },
            {
                "company_name": "Larsen & Toubro Heavy Engineering",
                "trade_code": "fitter",
                "title": "Heavy Equipment Erection Fitter",
                "description": "On-site assembly, leveling, and bolting of large industrial process vessels, agitators, and structural skids.",
                "responsibilities": "Level machine bedplates using precision spirit levels and optical transits; ream bolt holes; install heavy foundation bolts.",
                "qualification": "ITI Fitter",
                "experience_min": 2.0,
                "experience_max": 5.0,
                "salary_min": 24000,
                "salary_max": 31000,
                "location": "Powai",
                "city": "Mumbai",
                "state": "Maharashtra",
                "job_type": "Full Time",
                "skills": ["Machine Installation", "Mechanical Maintenance", "Measurement Tools", "Blueprint Reading", "Basic Welding"]
            },
            {
                "company_name": "Godrej & Boyce Mfg. Co. Ltd",
                "trade_code": "fitter",
                "title": "Tool & Die Maker / Precision Fitter",
                "description": "Finishing and fitting of precision stamping punches, progressive blanking dies, and plastic mold inserts.",
                "responsibilities": "Surface grinding, manual filing to within 10 microns, fitting guide pillars, dowel pins, and stripper plates.",
                "qualification": "ITI Fitter / Tool & Die",
                "experience_min": 1.5,
                "experience_max": 4.0,
                "salary_min": 23000,
                "salary_max": 29000,
                "location": "Vikhroli",
                "city": "Mumbai",
                "state": "Maharashtra",
                "job_type": "Full Time",
                "skills": ["Lathe Operation", "Measurement Tools", "Machine Assembly", "Blueprint Reading"]
            },
            {
                "company_name": "Bosch India Limited",
                "trade_code": "fitter",
                "title": "Pneumatic & Mechanical Maintenance Fitter",
                "description": "Preventive maintenance and breakdown repair on automated parts feeders, pneumatic grippers, cylinders, and index tables.",
                "responsibilities": "Replace pneumatic directional control valves and air filters; service ball screws, linear guideways, and lubrication manifolds.",
                "qualification": "ITI Fitter",
                "experience_min": 1.0,
                "experience_max": 3.0,
                "salary_min": 21500,
                "salary_max": 27000,
                "location": "Naganathapura",
                "city": "Bangalore",
                "state": "Karnataka",
                "job_type": "Full Time",
                "skills": ["Pneumatic Systems", "Hydraulic Systems", "Mechanical Maintenance", "Preventive Maintenance"]
            },
            {
                "company_name": "Mahindra & Mahindra Auto Division",
                "trade_code": "fitter",
                "title": "Engine Assembly Fitter",
                "description": "Fit crankshafts, connecting rods, pistons, and camshaft timing gears on high-speed diesel automotive engines.",
                "responsibilities": "Measure cylinder bore taper and piston ring gap with micrometer; verify bearing clearances with Plastigauge.",
                "qualification": "ITI Fitter",
                "experience_min": 0.5,
                "experience_max": 3.0,
                "salary_min": 20000,
                "salary_max": 25000,
                "location": "Chakan",
                "city": "Pune",
                "state": "Maharashtra",
                "job_type": "Full Time",
                "skills": ["Machine Assembly", "Measurement Tools", "Mechanical Maintenance", "Blueprint Reading"]
            },
            {
                "company_name": "Ashok Leyland Limited",
                "trade_code": "fitter",
                "title": "Hydraulic Maintenance Fitter",
                "description": "Maintain high-capacity hydraulic power packs, hydraulic cylinders, pressure relief valves, and accumulators across press shops.",
                "responsibilities": "Replace blown hydraulic hose pipes; service oil gear pumps; test hydraulic circuit pressures using gauge test points.",
                "qualification": "ITI Fitter",
                "experience_min": 1.5,
                "experience_max": 4.5,
                "salary_min": 22500,
                "salary_max": 28500,
                "location": "Ennore",
                "city": "Chennai",
                "state": "Tamil Nadu",
                "job_type": "Full Time",
                "skills": ["Hydraulic Systems", "Pneumatic Systems", "Mechanical Maintenance", "Preventive Maintenance"]
            },
            {
                "company_name": "TVS Motor Company",
                "trade_code": "fitter",
                "title": "Machine Tool Maintenance Fitter",
                "description": "Keep conveyor lines, overhead hoists, chain drives, and CNC machine coolant pumps running at peak availability.",
                "responsibilities": "Replace worn sprockets, V-belts, and roller chains; grease pillow block bearings; conduct scheduled TPM checklists.",
                "qualification": "ITI Fitter",
                "experience_min": 0.5,
                "experience_max": 2.5,
                "salary_min": 18500,
                "salary_max": 22500,
                "location": "Hosur",
                "city": "Chennai",
                "state": "Tamil Nadu",
                "job_type": "Full Time",
                "skills": ["Mechanical Maintenance", "Preventive Maintenance", "Machine Installation", "Measurement Tools"]
            },
            {
                "company_name": "Thermax Limited",
                "trade_code": "fitter",
                "title": "Boiler Pipe & Mechanical Fitter",
                "description": "Fabrication, cold bending, and fit-up of carbon and alloy steel boiler waterwall panels, headers, and steam manifolds.",
                "responsibilities": "Mark and bevel pipe ends according to isometric fabrication drawings; assemble tack-welded pipe joints for TIG welding.",
                "qualification": "ITI Fitter / ITI Welder",
                "experience_min": 1.5,
                "experience_max": 4.0,
                "salary_min": 23000,
                "salary_max": 29000,
                "location": "Bhosari",
                "city": "Pune",
                "state": "Maharashtra",
                "job_type": "Full Time",
                "skills": ["Machine Assembly", "Measurement Tools", "Blueprint Reading", "Basic Welding"]
            },
            {
                "company_name": "BEML Limited",
                "trade_code": "fitter",
                "title": "Bogie & Suspension Mechanical Fitter",
                "description": "Assembly of rail coach bogies, primary coil springs, air springs, brake calipers, and wheelset axle box bearings.",
                "responsibilities": "Press-fit spherical bearings; verify wheel gauge using master calipers; assemble disc brake actuators.",
                "qualification": "ITI Fitter (NCVT mandatory)",
                "experience_min": 1.0,
                "experience_max": 3.5,
                "salary_min": 22000,
                "salary_max": 27000,
                "location": "Bangalore Complex",
                "city": "Bangalore",
                "state": "Karnataka",
                "job_type": "Full Time",
                "skills": ["Machine Assembly", "Pneumatic Systems", "Measurement Tools", "Mechanical Maintenance"]
            },
            {
                "company_name": "Uno Minda Limited",
                "trade_code": "fitter",
                "title": "Injection Mould & Fixture Fitter",
                "description": "Assembly and preventive maintenance of plastic injection mold tools for automotive lighting housings and switches.",
                "responsibilities": "Clean mold parting lines, polish core and cavity surfaces, replace broken ejector pins and cooling O-rings.",
                "qualification": "ITI Fitter",
                "experience_min": 1.0,
                "experience_max": 3.0,
                "salary_min": 19500,
                "salary_max": 24000,
                "location": "IMT Manesar",
                "city": "Gurgaon",
                "state": "Haryana",
                "job_type": "Full Time",
                "skills": ["Measurement Tools", "Lathe Operation", "Machine Assembly", "Preventive Maintenance"]
            },
            {
                "company_name": "Sanand Auto Engineering MSME Cluster",
                "trade_code": "fitter",
                "title": "Conventional Lathe & Milling Fitter",
                "description": "Machining custom replacement shafts, bushings, threaded collars, and machine studs on engine lathe machines.",
                "responsibilities": "Perform OD/ID turning, facing, thread cutting, boring, and keyway milling on conventional machinery.",
                "qualification": "ITI Fitter / Machinist",
                "experience_min": 1.0,
                "experience_max": 3.5,
                "salary_min": 19000,
                "salary_max": 23500,
                "location": "GIDC Sanand",
                "city": "Ahmedabad",
                "state": "Gujarat",
                "job_type": "Full Time",
                "skills": ["Lathe Operation", "Measurement Tools", "Blueprint Reading", "Machine Assembly"]
            },
            {
                "company_name": "Endurance Technologies Ltd",
                "trade_code": "fitter",
                "title": "Hydraulic Trim Press Fitter",
                "description": "Setting up trim dies on hydraulic presses to remove runner gates and flash from aluminium die cast parts.",
                "responsibilities": "Clamp trim tools, align top and bottom punch dies, check hydraulic stroke settings, lubricate die guide pins.",
                "qualification": "ITI Fitter",
                "experience_min": 0.5,
                "experience_max": 2.5,
                "salary_min": 18500,
                "salary_max": 22500,
                "location": "Waluj MIDC",
                "city": "Aurangabad",
                "state": "Maharashtra",
                "job_type": "Full Time",
                "skills": ["Hydraulic Systems", "Measurement Tools", "Machine Assembly", "Preventive Maintenance"]
            },
            {
                "company_name": "Force Motors Limited",
                "trade_code": "fitter",
                "title": "Chassis Axle Fitting Technician",
                "description": "Assembly of front steerable axles, kingpins, leaf spring shackles, and steering drag links.",
                "responsibilities": "Measure kingpin thrust washer float; grease hub bearings; set wheel toe-in and camber alignment.",
                "qualification": "ITI Fitter",
                "experience_min": 1.0,
                "experience_max": 3.0,
                "salary_min": 19000,
                "salary_max": 23000,
                "location": "Akurdi",
                "city": "Pune",
                "state": "Maharashtra",
                "job_type": "Full Time",
                "skills": ["Machine Assembly", "Mechanical Maintenance", "Measurement Tools", "Preventive Maintenance"]
            },
            {
                "company_name": "Cummins India Limited",
                "trade_code": "fitter",
                "title": "Turbocharger & Fuel Pump Fitter",
                "description": "High-precision mechanical bench fitting of turbocharger cartridge assemblies and high-pressure common rail fuel pumps.",
                "responsibilities": "Dynamic rotor balancing, dynamic seal fitting, measuring radial and axial clearances to micron tolerances.",
                "qualification": "ITI Fitter",
                "experience_min": 1.5,
                "experience_max": 4.0,
                "salary_min": 22500,
                "salary_max": 28000,
                "location": "Phaltan Megasite",
                "city": "Pune",
                "state": "Maharashtra",
                "job_type": "Full Time",
                "skills": ["Machine Assembly", "Measurement Tools", "Mechanical Maintenance", "Preventive Maintenance"]
            },
            {
                "company_name": "Peenya Precision Tool & Die Works",
                "trade_code": "fitter",
                "title": "Machine Installation & Leveling Fitter",
                "description": "Installation of newly arrived industrial machinery, CNC lathe machines, overhead gantries, and compressed air headers.",
                "responsibilities": "Grouting machine base pads, vibration damper positioning, leveling bedways with master bubble levels.",
                "qualification": "ITI Fitter",
                "experience_min": 1.0,
                "experience_max": 3.5,
                "salary_min": 20500,
                "salary_max": 25500,
                "location": "Peenya Industrial Area",
                "city": "Bangalore",
                "state": "Karnataka",
                "job_type": "Full Time",
                "skills": ["Machine Installation", "Measurement Tools", "Pneumatic Systems", "Blueprint Reading"]
            },
            {
                "company_name": "Schneider Electric India",
                "trade_code": "fitter",
                "title": "Mechanical Busbar & Sheet Metal Fitter",
                "description": "Cutting, punching, bending, and bolting of copper/aluminium power busbars inside low voltage switchboard enclosures.",
                "responsibilities": "Operate hydraulic busbar bending and punching machines; torque bolt joints to specific N-m standards; assemble modular sheet metal frames.",
                "qualification": "ITI Fitter / ITI Sheet Metal",
                "experience_min": 0.5,
                "experience_max": 2.5,
                "salary_min": 19000,
                "salary_max": 23500,
                "location": "Peenya",
                "city": "Bangalore",
                "state": "Karnataka",
                "job_type": "Full Time",
                "skills": ["Measurement Tools", "Hydraulic Systems", "Machine Assembly", "Blueprint Reading"]
            }
        ]

        comp_dict = {c.name: c for c in company_objs}

        for j_item in jobs_seed_list:
            comp_obj = comp_dict.get(j_item["company_name"], company_objs[0])
            trade_obj = trade_objs.get(j_item["trade_code"])
            skills_req = j_item.pop("skills", [])

            job = Job(
                company_id=comp_obj.id,
                trade_id=trade_obj.id,
                title=j_item["title"],
                description=j_item["description"],
                responsibilities=j_item.get("responsibilities"),
                qualification=j_item["qualification"],
                experience_min=j_item["experience_min"],
                experience_max=j_item["experience_max"],
                salary_min=j_item["salary_min"],
                salary_max=j_item["salary_max"],
                salary_type="per_month",
                location=j_item["location"],
                city=j_item["city"],
                state=j_item["state"],
                job_type=j_item["job_type"],
                application_url=f"https://careers.{comp_obj.website.replace('https://www.', '')}/apply" if comp_obj.website else None,
                status="active"
            )
            db.add(job)
            db.flush()

            # Attach skills
            for sname in skills_req:
                skey = f"{j_item['trade_code']}:{sname}"
                if skey in skill_objs:
                    js = JobSkill(job_id=job.id, skill_id=skill_objs[skey].id, is_required=True)
                    db.add(js)

        # 7. APPRENTICESHIPS (NAPS/NEEM Industrial Apprenticeships)
        apprenticeship_data = [
            {
                "company_name": "Tata Motors Vendor Network",
                "trade_code": "welder",
                "title": "Automotive Welder Apprentice (NAPS Scheme)",
                "description": "12-month apprentice training on vehicle frame spot and MIG welding cells. Government stipend reimbursement under NAPS-2.",
                "stipend_min": 12500,
                "stipend_max": 15000,
                "duration_months": 12,
                "location": "Pimpri & Chakan",
                "city": "Pune",
                "state": "Maharashtra",
                "eligibility": "ITI Welder (Passout within last 2 years)",
                "positions": 25,
                "application_url": "https://www.apprenticeshipindia.gov.in"
            },
            {
                "company_name": "Bosch India Limited",
                "trade_code": "electrician",
                "title": "Industrial Electrician Apprentice (DGT Recognized)",
                "description": "Comprehensive practical training on automated manufacturing lines, control panels, and electrical safety standards.",
                "stipend_min": 14000,
                "stipend_max": 16500,
                "duration_months": 12,
                "location": "Adugodi & Naganathapura",
                "city": "Bangalore",
                "state": "Karnataka",
                "eligibility": "ITI Electrician with minimum 60% marks",
                "positions": 30,
                "application_url": "https://www.apprenticeshipindia.gov.in"
            },
            {
                "company_name": "Bharat Forge Ltd",
                "trade_code": "fitter",
                "title": "Mechanical Press Line Fitter Apprentice",
                "description": "On-the-job training in heavy press mechanics, hydraulic circuit troubleshooting, and machine assembly.",
                "stipend_min": 13500,
                "stipend_max": 16000,
                "duration_months": 12,
                "location": "Mundhwa",
                "city": "Pune",
                "state": "Maharashtra",
                "eligibility": "ITI Fitter Passout",
                "positions": 20,
                "application_url": "https://www.apprenticeshipindia.gov.in"
            },
            {
                "company_name": "Schneider Electric India",
                "trade_code": "electrician",
                "title": "Panel Wiring & Switchgear Apprentice",
                "description": "Learn modern switchgear assembly, relay wiring, and digital energy meter calibration.",
                "stipend_min": 13000,
                "stipend_max": 15500,
                "duration_months": 12,
                "location": "Peenya",
                "city": "Bangalore",
                "state": "Karnataka",
                "eligibility": "ITI Electrician / Wireman",
                "positions": 15,
                "application_url": "https://www.apprenticeshipindia.gov.in"
            },
            {
                "company_name": "Ashok Leyland Limited",
                "trade_code": "fitter",
                "title": "Chassis & Powertrain Fitter Apprentice",
                "description": "Commercial truck chassis assembly, air brake tubing, and gearbox fitting.",
                "stipend_min": 12800,
                "stipend_max": 15000,
                "duration_months": 12,
                "location": "Ennore",
                "city": "Chennai",
                "state": "Tamil Nadu",
                "eligibility": "ITI Fitter (NCVT)",
                "positions": 20,
                "application_url": "https://www.apprenticeshipindia.gov.in"
            },
            {
                "company_name": "Thermax Limited",
                "trade_code": "welder",
                "title": "TIG / Arc Boiler Welder Apprentice",
                "description": "TIG root pass welding on carbon and stainless steel pressure tubes under expert supervision.",
                "stipend_min": 13000,
                "stipend_max": 16000,
                "duration_months": 12,
                "location": "Bhosari",
                "city": "Pune",
                "state": "Maharashtra",
                "eligibility": "ITI Welder",
                "positions": 12,
                "application_url": "https://www.apprenticeshipindia.gov.in"
            }
        ]

        for app_item in apprenticeship_data:
            c_obj = comp_dict.get(app_item["company_name"], company_objs[0])
            t_obj = trade_objs.get(app_item["trade_code"])
            appr = Apprenticeship(
                company_id=c_obj.id,
                trade_id=t_obj.id,
                title=app_item["title"],
                description=app_item["description"],
                stipend_min=app_item["stipend_min"],
                stipend_max=app_item["stipend_max"],
                duration_months=app_item["duration_months"],
                location=app_item["location"],
                city=app_item["city"],
                state=app_item["state"],
                eligibility=app_item["eligibility"],
                positions=app_item["positions"],
                application_url=app_item["application_url"],
                status="active"
            )
            db.add(appr)

        # 8. DEFAULT USERS: ADMIN & DEMO STUDENTS
        # Admin
        admin_user = User(
            full_name="SkillMatch Administrator",
            email="admin@skillmatch.in",
            phone="+91 98200 99881",
            hashed_password=get_password_hash("admin123"),
            role="admin",
            is_active=True
        )
        db.add(admin_user)
        db.flush()

        # Demo Student 1: Electrician (Rahul Sharma, Pune, 1 yr experience)
        rahul = User(
            full_name="Rahul Sharma",
            email="rahul.electrician@gmail.com",
            phone="+91 98901 12345",
            hashed_password=get_password_hash("student123"),
            role="student",
            is_active=True
        )
        db.add(rahul)
        db.flush()

        rahul_profile = StudentProfile(
            user_id=rahul.id,
            trade_id=trade_objs["electrician"].id,
            qualification="ITI Electrician (NCVT)",
            experience_years=1.0,
            preferred_location="Pune",
            expected_salary_min=18000,
            expected_salary_max=24000,
            bio="NCVT certified Electrician with 1 year experience in industrial wiring, control panels, and motor repair. Seeking local manufacturing plant role.",
            institute_name="Government ITI Pune (Aundh)",
            year_of_passing=2023
        )
        db.add(rahul_profile)
        db.flush()

        rahul_skills = ["Electrical Wiring", "Industrial Wiring", "Panel Wiring", "Motor Repair", "Electrical Maintenance", "Electrical Safety"]
        for rs in rahul_skills:
            skey = f"electrician:{rs}"
            if skey in skill_objs:
                db.add(StudentSkill(student_profile_id=rahul_profile.id, skill_id=skill_objs[skey].id, proficiency_level="Intermediate"))

        # Demo Student 2: Welder (Amit Jadhav, Pune, 2 yrs experience)
        amit = User(
            full_name="Amit Jadhav",
            email="amit.welder@gmail.com",
            phone="+91 98223 34455",
            hashed_password=get_password_hash("student123"),
            role="student",
            is_active=True
        )
        db.add(amit)
        db.flush()

        amit_profile = StudentProfile(
            user_id=amit.id,
            trade_id=trade_objs["welder"].id,
            qualification="ITI Welder",
            experience_years=2.0,
            preferred_location="Pune",
            expected_salary_min=20000,
            expected_salary_max=26000,
            bio="Specialized in MIG and Arc structural welding with 2 years fabrication shop floor experience in Chakan automotive cluster.",
            institute_name="Government ITI Pimpri-Chinchwad",
            year_of_passing=2022
        )
        db.add(amit_profile)
        db.flush()

        amit_skills = ["MIG Welding", "Arc Welding", "Metal Fabrication", "Cutting", "Grinding"]
        for as_skill in amit_skills:
            skey = f"welder:{as_skill}"
            if skey in skill_objs:
                db.add(StudentSkill(student_profile_id=amit_profile.id, skill_id=skill_objs[skey].id, proficiency_level="Expert"))

        # Demo Student 3: Fitter (Sunil Kumar, Bangalore, Fresher)
        sunil = User(
            full_name="Sunil Kumar",
            email="sunil.fitter@gmail.com",
            phone="+91 94490 88776",
            hashed_password=get_password_hash("student123"),
            role="student",
            is_active=True
        )
        db.add(sunil)
        db.flush()

        sunil_profile = StudentProfile(
            user_id=sunil.id,
            trade_id=trade_objs["fitter"].id,
            qualification="ITI Fitter",
            experience_years=0.0,
            preferred_location="Bangalore",
            expected_salary_min=15000,
            expected_salary_max=20000,
            bio="Fresh ITI Fitter graduate trained in lathe operations, machine tool assembly, and pneumatic systems seeking apprenticeship or entry-level technician job.",
            institute_name="Government ITI Peenya",
            year_of_passing=2024
        )
        db.add(sunil_profile)
        db.flush()

        sunil_skills = ["Machine Assembly", "Lathe Operation", "Measurement Tools", "Pneumatic Systems"]
        for ss_skill in sunil_skills:
            skey = f"fitter:{ss_skill}"
            if skey in skill_objs:
                db.add(StudentSkill(student_profile_id=sunil_profile.id, skill_id=skill_objs[skey].id, proficiency_level="Intermediate"))

        db.commit()
        print("SkillMatch database successfully seeded with 50+ jobs, 20+ companies, 15+ institutes, official schemes and demo users!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
