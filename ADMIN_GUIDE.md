# Admin Dashboard User Guide

Welcome to the Premium Hair Wigs & Extensions Admin Dashboard! This guide will help you navigate and use all features of the admin panel.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Orders Management](#orders-management)
4. [Payments Management](#payments-management)
5. [Products & Inventory](#products--inventory)
6. [Customers Management](#customers-management)
7. [Discounts & Promotions](#discounts--promotions)
8. [Returns & Refunds](#returns--refunds)
9. [Reports & Analytics](#reports--analytics)
10. [Compliance & Legal](#compliance--legal)
11. [Security & Activity Logs](#security--activity-logs)
12. [Role-Based Permissions](#role-based-permissions)
13. [Keyboard Shortcuts](#keyboard-shortcuts)
14. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Logging In

1. Navigate to the admin dashboard URL (e.g., `https://your-admin-url.com/login`)
2. Enter your admin email and password
3. (Optional) Check "Remember Me" to stay logged in on this device
4. Click "Login" to access the dashboard

**Security Note**: Only use "Remember Me" on trusted devices. Your session will auto-logout after 30 minutes of inactivity for security.

### First Time Login

After your first login:
1. Change your password immediately (contact your administrator)
2. Familiarize yourself with your role and permissions
3. Review the overview dashboard to understand current business metrics

---

## Dashboard Overview

The **Overview Panel** is your home page showing:

### Key Metrics (Auto-refreshes every 30 seconds)
- **Orders Today**: Total orders received today with revenue
- **Revenue Today**: Total revenue in ZAR
- **Pending Orders**: Orders awaiting processing (⚠️ alerts if > 10)
- **Low Stock Alerts**: Products with stock below threshold

### Recent Orders
Quick view of the most recent 5 orders with:
- Order number
- Customer name
- Amount
- Status
- Date placed

### Quick Actions
- **Add Product**: Jump to product creation
- **Create Discount**: Jump to discount creation
- **View All Orders**: Navigate to orders panel
- **View Reports**: Navigate to analytics

---

## Orders Management

### Viewing Orders

**Navigation**: Click "Orders" in the sidebar

**Features**:
- Search orders by order number or customer name
- Filter by status: All, Pending, Processing, Shipped, Delivered, Cancelled
- View order details by clicking "View" button
- Automatic pagination for large order lists

### Order Details Modal

Click "View" on any order to see:
- **Customer Information**: Name, email, phone
- **Shipping Address**: Full delivery address
- **Order Status**: Current status and payment status
- **Order Items**: List of products with quantities and prices
- **Timeline**: When order was placed

### Updating Order Status

**Permissions Required**: Staff or Super Admin

1. Open order details modal
2. Select new status from dropdown:
   - Pending
   - Processing
   - Shipped
   - Delivered
   - Cancelled
3. Click "Update Status"
4. Confirm the action

**Best Practices**:
- Update status promptly to keep customers informed
- Move orders from Pending → Processing → Shipped → Delivered
- Only cancel orders with valid reasons

### Printing Invoices

Click "Print Invoice" button in order details (feature in development with backend support).

---

## Payments Management

### Viewing Payments

**Navigation**: Click "Payments" in the sidebar

**Features**:
- View all payment transactions
- Filter by status: All, Pending, Completed, Failed, Refunded
- See payment method and amount
- Track payment dates

### Payment Information

Each payment entry shows:
- **Payment ID**: Unique identifier
- **Order Number**: Associated order
- **Customer**: Customer name
- **Amount**: Transaction amount in ZAR
- **Method**: Payment method (e.g., PayFast, Credit Card)
- **Status**: Current payment status
- **Date**: Transaction date

### Processing Refunds

**Permissions Required**: Super Admin

1. Locate the payment transaction
2. Click "Refund" (when available)
3. Enter refund amount and reason
4. Confirm refund

**Note**: Refund functionality requires backend API integration.

---

## Products & Inventory

### Viewing Products

**Navigation**: Click "Products & Inventory" in the sidebar

**Features**:
- Search products by name or SKU
- Filter by category: Wigs, Extensions, Accessories
- Low stock indicators (red badge if stock < 5)
- View stock levels and prices

### Adding a New Product

**Permissions Required**: Staff or Super Admin

1. Click "Add Product" button
2. Fill in the form:
   - **Product Name*** (required)
   - **SKU**: Stock keeping unit (optional)
   - **Description**: Product description
   - **Category*** (required): Select from dropdown
   - **Price (incl. VAT)*** (required): Price including 15% VAT
   - **Stock Quantity*** (required): Current stock level
   - **Low Stock Threshold**: Alert threshold (default: 5)
   - **Active**: Toggle to activate/deactivate
3. Click "Create Product"

### Editing a Product

**Permissions Required**: Staff or Super Admin

1. Click "Edit" button on product row
2. Modify any field in the form
3. Click "Update Product"

**Tips**:
- Keep product descriptions clear and informative
- Update stock levels regularly
- Set appropriate low stock thresholds
- Deactivate products instead of deleting them

### Managing Stock Levels

Monitor stock levels regularly:
- **Green**: Adequate stock
- **Red/Warning**: Low stock (below threshold)

Update stock after:
- Receiving new inventory
- Processing returns
- Inventory audits

---

## Customers Management

### Viewing Customers

**Navigation**: Click "Customers" in the sidebar

**Features**:
- Search customers by name or email
- View customer status (Active/Inactive)
- See join date
- Access customer details

### Customer Information

Each customer entry shows:
- **Name**: Full name
- **Email**: Contact email
- **Phone**: Contact number
- **Status**: Active or Inactive
- **Joined**: Registration date

### Customer Details

Click "View" to see (feature in development):
- Order history
- Total spending
- Saved addresses
- Account preferences

---

## Discounts & Promotions

### Viewing Discounts

**Navigation**: Click "Discounts" in the sidebar

**Features**:
- View all discount codes
- See usage statistics
- Check expiry dates
- Monitor active/inactive status

### Creating a Discount Code

**Permissions Required**: Staff or Super Admin

1. Click "Create Discount" button
2. Fill in the form:
   - **Discount Code*** (required): Uppercase alphanumeric (e.g., SUMMER2024)
   - **Description**: Purpose of discount
   - **Type*** (required): Percentage or Fixed amount
   - **Value*** (required): Discount value
   - **Usage Limit**: Max number of uses (optional)
   - **Expiry Date**: When discount expires (optional)
   - **Active**: Toggle to activate/deactivate
3. Click "Create"

**Tips**:
- Use clear, memorable discount codes
- Set appropriate usage limits to control costs
- Set expiry dates for time-limited promotions
- Test codes before sharing with customers

### Editing a Discount

1. Click "Edit" button on discount row
2. Modify fields (Note: Code cannot be changed)
3. Click "Update"

### Discount Best Practices

- Create unique codes for different campaigns
- Track usage to measure campaign effectiveness
- Deactivate expired or completed promotions
- Use percentage discounts for flexibility
- Use fixed amount discounts for specific value offers

---

## Returns & Refunds

### Viewing Returns

**Navigation**: Click "Returns & Refunds" in the sidebar

**Features**:
- View all return requests
- Filter by status: Requested, Approved, Rejected, Received, Refunded
- See return reasons
- Track return dates

### Return Information

Each return entry shows:
- **Return Number**: Unique identifier
- **Order Number**: Original order
- **Customer**: Customer name
- **Reason**: Customer-provided reason
- **Status**: Current return status
- **Requested Date**: When return was requested

### Processing Returns

**Permissions Required**: Staff or Super Admin

1. Click "View" on return request
2. Review return details and reason
3. Choose action:
   - **Approve**: Accept return and initiate refund
   - **Reject**: Decline return with reason
4. Process refund if approved

**Return Policy Guidelines**:
- Review return reason carefully
- Check order date (within return window?)
- Verify product condition
- Communicate decision to customer
- Process approved refunds promptly

---

## Reports & Analytics

### Generating Reports

**Navigation**: Click "Reports & Analytics" in the sidebar

### Sales Reports

1. Select date range:
   - Start date
   - End date
2. Click "Generate"

**Report Includes**:
- Total Revenue
- Total Orders
- Average Order Value
- Revenue by date breakdown

### Product Performance Reports

1. Click "View Top Products"
2. Review top-selling products by:
   - Units sold
   - Revenue generated

### Exporting Reports

Click "Export to CSV" to download report data (feature in development).

**Use Cases**:
- Monthly sales analysis
- Product performance evaluation
- Revenue trend identification
- Business planning and forecasting

---

## Compliance & Legal

### VAT Records

**Navigation**: Click "Compliance & Legal" in the sidebar

**Features**:
- View all VAT transactions
- Filter by date range
- See invoice numbers
- Track VAT amounts

### VAT Record Information

Each record shows:
- **Invoice Number**: Tax invoice number
- **Order Number**: Associated order
- **Date**: Transaction date
- **Subtotal**: Amount before VAT
- **VAT**: 15% VAT amount
- **Total**: Amount including VAT

### Policy Documents

View and manage:
- Privacy Policy (POPIA compliance)
- Terms of Service
- Refund Policy
- Other legal documents

**POPIA Compliance**:
The system maintains compliance with South Africa's Protection of Personal Information Act (POPIA) by:
- Securing customer data
- Providing data access controls
- Enabling data export on request
- Maintaining audit trails

---

## Security & Activity Logs

**Permissions Required**: Super Admin

### Viewing Activity Logs

**Navigation**: Click "Security & Logs" in the sidebar

**Tabs**:
1. **Activity Logs**: Admin actions
2. **Security Events**: Security incidents

### Activity Logs

Monitor admin actions:
- Who performed the action
- What action was taken
- Which entity was affected
- IP address
- Severity level (Info, Warning, Critical)
- Timestamp

**Filter Options**:
- Filter by severity
- Search by admin name or IP
- Date range filtering

### Security Events

Monitor security incidents:
- Event type (Login attempts, unauthorized access, etc.)
- Description
- Severity level (Low, Medium, High, Critical)
- IP address
- Resolved status
- Timestamp

**Security Best Practices**:
- Review logs regularly
- Investigate critical severity events immediately
- Monitor failed login attempts
- Track unusual IP addresses
- Report suspicious activity

---

## Role-Based Permissions

### Staff Role

**Can Do**:
- View all panels
- Update orders
- Process returns
- Manage inventory
- Update stock levels
- Create and edit products
- Create discounts
- View customers
- View payments

**Cannot Do**:
- Delete products
- View security logs
- Manage admin accounts
- Access system settings
- Delete discounts permanently

### Super Admin Role

**Full Access** to:
- All Staff permissions
- Delete operations
- Security logs and activity monitoring
- System settings
- Admin account management
- All advanced features

### Permission Checks

The system automatically:
- Hides restricted features based on role
- Shows permission warnings for unauthorized actions
- Logs all admin activities
- Maintains security audit trail

---

## Keyboard Shortcuts

(To be implemented in future versions)

**Planned Shortcuts**:
- `Ctrl/Cmd + K`: Global search
- `Ctrl/Cmd + N`: New product
- `Ctrl/Cmd + R`: Refresh current panel
- `Escape`: Close modal
- `/`: Focus search input

---

## Troubleshooting

### Common Issues

#### Cannot Login

**Solutions**:
1. Verify email and password are correct
2. Check if account is active
3. Clear browser cache and cookies
4. Try "Forgot Password" (if implemented)
5. Contact system administrator

#### Session Expired

The system auto-logs out after 30 minutes of inactivity.

**Solution**: Simply log in again.

#### Page Won't Load

**Solutions**:
1. Check internet connection
2. Refresh the page (F5 or Ctrl+R)
3. Clear browser cache
4. Try a different browser
5. Contact system administrator

#### Cannot See Certain Features

**Reason**: Role-based restrictions

**Solution**: Contact Super Admin to verify your permissions.

#### Data Not Updating

**Solutions**:
1. Click the "Refresh" button on the panel
2. Check backend API status
3. Verify internet connection
4. Review browser console for errors

#### Modal Won't Close

**Solutions**:
1. Click the X button in top-right
2. Click outside the modal
3. Press Escape key (if implemented)
4. Refresh the page

### Browser Compatibility

**Supported Browsers**:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Recommended**: Use the latest version of Chrome or Firefox for best experience.

### Performance Tips

1. **Use Filters**: Filter data to reduce load times
2. **Close Unused Tabs**: Keep only necessary browser tabs open
3. **Clear Cache**: Clear browser cache periodically
4. **Stable Connection**: Use stable internet connection
5. **Update Browser**: Keep browser updated to latest version

---

## Getting Help

### Contact Support

- **Email**: support@premiumhairsa.co.za
- **Technical Issues**: Check browser console (F12) for error messages
- **Feature Requests**: Contact your system administrator

### Reporting Bugs

When reporting issues, include:
1. Description of the problem
2. Steps to reproduce
3. Browser and version
4. Screenshot (if applicable)
5. Any error messages

---

## Security Best Practices

1. **Strong Passwords**: Use passwords with 12+ characters, including uppercase, lowercase, numbers, and symbols
2. **Logout**: Always logout when finished, especially on shared computers
3. **Remember Me**: Only use on trusted, personal devices
4. **Suspicious Activity**: Report any unusual activity immediately
5. **Session Management**: System auto-logs out after 30 minutes of inactivity
6. **Private Data**: Never share customer information outside the system
7. **POPIA Compliance**: Handle all data in accordance with privacy regulations

---

## Updates and Changes

This guide will be updated as new features are added. Check back regularly for updates.

**Version**: 1.0  
**Last Updated**: February 2026  
**Next Review**: March 2026

---

## Quick Reference Card

### Most Common Tasks

| Task | Steps |
|------|-------|
| Add Product | Products → Add Product → Fill Form → Save |
| Update Order Status | Orders → View → Select Status → Update |
| Create Discount | Discounts → Create Discount → Fill Form → Save |
| Generate Sales Report | Reports → Select Dates → Generate |
| View Activity Logs | Security & Logs → Activity Logs Tab |
| Process Return | Returns → View → Approve/Reject |
| Check Low Stock | Overview → Low Stock Alerts Card |
| Search Orders | Orders → Search Box → Enter Query |

### Important Numbers

- **Auto-refresh Interval**: 30 seconds (Overview panel)
- **Session Timeout**: 30 minutes of inactivity
- **Low Stock Threshold**: Default 5 units
- **VAT Rate**: 15% (South Africa)
- **Default Pagination**: 20 items per page

---

**Thank you for using the Premium Hair Admin Dashboard!**

For additional support, contact your system administrator.
