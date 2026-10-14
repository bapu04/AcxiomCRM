import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import User from '../models/User.js';
import Customer from '../models/Customer.js';
import Lead from '../models/Lead.js';
import Opportunity from '../models/Opportunity.js';
import FollowUp from '../models/FollowUp.js';
import Activity from '../models/Activity.js';
import AuditLog from '../models/AuditLog.js';
import { connectDB } from '../config/db.js';

export const seedDatabase = async () => {
  try {
    console.log('[AcxiomCRM Seed] Starting initial data seeding...');

    // 1. Seed Core Users if they do not exist
    const adminEmail = 'admin@acxiomcrm.com';
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = await User.create({
        name: 'CRM System Admin',
        email: adminEmail,
        password: 'Admin@12345',
        role: 'Admin',
        isActive: true,
      });
      console.log(' -> Created Admin user: admin@acxiomcrm.com / Admin@12345');
    }

    const managerEmail = 'manager@acxiomcrm.com';
    let manager = await User.findOne({ email: managerEmail });
    if (!manager) {
      manager = await User.create({
        name: 'Sales Manager - Sarah Jenkins',
        email: managerEmail,
        password: 'Manager@12345',
        role: 'Manager',
        isActive: true,
      });
      console.log(' -> Created Manager user: manager@acxiomcrm.com / Manager@12345');
    }

    const salesEmail = 'sales@acxiomcrm.com';
    let sales = await User.findOne({ email: salesEmail });
    if (!sales) {
      sales = await User.create({
        name: 'Sales Exec - Rahul Sharma',
        email: salesEmail,
        password: 'Sales@12345',
        role: 'SalesExecutive',
        isActive: true,
      });
      console.log(' -> Created Sales Executive user: sales@acxiomcrm.com / Sales@12345');
    }

    // 2. Check if CRM sample records exist
    const customerCount = await Customer.countDocuments();
    if (customerCount === 0) {
      console.log(' -> Seeding initial sample customers, leads, opportunities, and follow-ups...');

      // Seed Customers
      const cust1 = await Customer.create({
        customerCode: 'CUST-00001',
        name: 'Apex Global Technologies',
        email: 'contact@apextech.com',
        phone: '+919876543210',
        companyName: 'Apex Global Tech Ltd',
        address: '104 Cyber City, Phase 2',
        city: 'Gurugram',
        state: 'Haryana',
        status: 'Active',
        assignedTo: sales._id,
        notes: 'Enterprise cloud migration client',
        createdBy: admin._id,
      });

      const cust2 = await Customer.create({
        customerCode: 'CUST-00002',
        name: 'Nexus Healthcare Solutions',
        email: 'procurement@nexushealth.org',
        phone: '+919811223344',
        companyName: 'Nexus Health Pvt Ltd',
        address: 'Plot 45, Healthcare Park',
        city: 'Bengaluru',
        state: 'Karnataka',
        status: 'Active',
        assignedTo: sales._id,
        notes: 'EMR software overhaul requirement',
        createdBy: manager._id,
      });

      const cust3 = await Customer.create({
        customerCode: 'CUST-00003',
        name: 'BlueWave Logistics',
        email: 'info@bluewavelog.com',
        phone: '+919822334455',
        companyName: 'BlueWave Freight Systems',
        address: 'Shipping Hub 12, Port Area',
        city: 'Mumbai',
        state: 'Maharashtra',
        status: 'Active',
        assignedTo: manager._id,
        notes: 'Fleet management tracking systems',
        createdBy: admin._id,
      });

      // Seed Leads
      const lead1 = await Lead.create({
        leadCode: 'LEAD-00001',
        name: 'Horizon Retailers',
        email: 'director@horizonretail.com',
        phone: '+919833445566',
        companyName: 'Horizon Marts India',
        source: 'Website',
        status: 'Qualified',
        priority: 'High',
        expectedValue: 125000,
        assignedTo: sales._id,
        notes: 'Interested in omni-channel POS solution',
        createdBy: sales._id,
      });

      const lead2 = await Lead.create({
        leadCode: 'LEAD-00002',
        name: 'Vanguard FinTech',
        email: 'cto@vanguardfin.io',
        phone: '+919844556677',
        companyName: 'Vanguard Capital Partners',
        source: 'Referral',
        status: 'Contacted',
        priority: 'High',
        expectedValue: 240000,
        assignedTo: sales._id,
        notes: 'Payment gateway integration inquiry',
        createdBy: manager._id,
      });

      const lead3 = await Lead.create({
        leadCode: 'LEAD-00003',
        name: 'Zenith Solar Systems',
        email: 'sales@zenithsolar.in',
        phone: '+919855667788',
        companyName: 'Zenith Clean Energy',
        source: 'Cold Call',
        status: 'New',
        priority: 'Medium',
        expectedValue: 50000,
        assignedTo: sales._id,
        notes: 'Renewable energy incentive tracker',
        createdBy: sales._id,
      });

      // Seed Opportunities (with dates in future for active deals)
      const futureDate30 = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const futureDate60 = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);

      const opp1 = await Opportunity.create({
        opportunityCode: 'OPP-00001',
        name: 'Apex - Cloud Infrastructure Modernization',
        customerId: cust1._id,
        amount: 85000,
        stage: 'Proposal',
        probability: 60,
        expectedCloseDate: futureDate30,
        assignedTo: sales._id,
        notes: 'Client reviewed technical proposal; awaiting security sign-off',
        createdBy: sales._id,
      });

      const opp2 = await Opportunity.create({
        opportunityCode: 'OPP-00002',
        name: 'Nexus - Enterprise Hospital CRM Suite',
        customerId: cust2._id,
        amount: 140000,
        stage: 'Negotiation',
        probability: 80,
        expectedCloseDate: futureDate60,
        assignedTo: sales._id,
        notes: 'Commercial terms being finalized with CFO',
        createdBy: manager._id,
      });

      const opp3 = await Opportunity.create({
        opportunityCode: 'OPP-00003',
        name: 'BlueWave - IoT Tracking Pilot',
        customerId: cust3._id,
        amount: 45000,
        stage: 'Won',
        probability: 100,
        expectedCloseDate: new Date(),
        status: 'Won',
        assignedTo: manager._id,
        notes: 'Deal closed and contracted',
        createdBy: admin._id,
      });

      // Seed FollowUps (Dates today or future)
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const dayAfter = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);

      await FollowUp.create({
        customerId: cust1._id,
        opportunityId: opp1._id,
        followUpDate: tomorrow,
        followUpType: 'Meeting',
        subject: 'Architecture deep dive with Apex Lead Architect',
        remarks: 'Prepare benchmark metrics on AWS vs Azure',
        status: 'Planned',
        assignedTo: sales._id,
        createdBy: sales._id,
      });

      await FollowUp.create({
        customerId: cust2._id,
        opportunityId: opp2._id,
        followUpDate: dayAfter,
        followUpType: 'Call',
        subject: 'Review revised license pricing with Nexus VP',
        remarks: 'Discuss volume discount structure',
        status: 'Planned',
        assignedTo: sales._id,
        createdBy: manager._id,
      });

      // Seed Activities
      await Activity.create({
        activityType: 'Call',
        subject: 'Introductory discovery call with Apex',
        description: 'Discussed high level pain points with current legacy CRM setup',
        customerId: cust1._id,
        assignedTo: sales._id,
        status: 'Completed',
        createdBy: sales._id,
      });

      await Activity.create({
        activityType: 'Meeting',
        subject: 'Solution demonstration for Nexus',
        description: 'Conducted 90-minute live demo of CRM modules with clinical staff',
        customerId: cust2._id,
        assignedTo: sales._id,
        status: 'Completed',
        createdBy: manager._id,
      });

      // Seed initial Audit Logs
      await AuditLog.create({
        userId: admin._id,
        userEmail: admin.email,
        userRole: admin.role,
        action: 'CREATE',
        entityName: 'Customer',
        recordId: String(cust1._id),
        details: 'Initial seed customer created: Apex Global Technologies',
        ipAddress: '127.0.0.1',
      });

      await AuditLog.create({
        userId: sales._id,
        userEmail: sales.email,
        userRole: sales.role,
        action: 'CREATE',
        entityName: 'Opportunity',
        recordId: String(opp1._id),
        details: 'Initial opportunity created: Apex Cloud Modernization ($85,000)',
        ipAddress: '127.0.0.1',
      });

      console.log(' -> Sample CRM data seeded successfully!');
    }

    console.log('[AcxiomCRM Seed] Seeding check complete.');
  } catch (err) {
    console.error('[AcxiomCRM Seed Error]', err.message);
  }
};

// If run directly via `node src/seeds/seed.js`
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  (async () => {
    await connectDB();
    await seedDatabase();
    await mongoose.disconnect();
    console.log('[AcxiomCRM Seed] Finished and disconnected.');
    process.exit(0);
  })();
}
