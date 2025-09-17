describe('Dashboard Component Tests', () => {
    // Mock data for the API responses
    const validData = {
        name: 'John Doe',
        email: 'johndoe@example.com',
        phone: '1234567890',
        password: 'password123',
    };
    const homeDataMock = {
        totalRevenue: 55200,
        appOrders: 150,
        manualOrders: 50,
        peakSlot: 'SLOT_13_14',
        bestSellerProduct: { name: 'Burger', id: 'prod-1' },
        totalRechargedAmount: 12000,
        lowStockProducts: ['Cola', 'Fries'],
        ticketsCount: 5
    };

    const recentOrdersMock = {
        orders: [
            {
                billNumber: '1001', customerName: 'Alice', items: [{ name: 'Pizza', quantity: 1 }, { name: 'Coke', quantity: 2 }], status: 'completed',
                orderType: 'App', paymentMode: 'Card', createdAt: '2025-09-15T10:00:00Z'
            },
            {
                billNumber: '1002', customerName: 'Bob', items: [{ name: 'Burger', quantity: 1 }], status: 'pending',
                orderType: 'Manual', paymentMode: 'Cash', createdAt: '2025-09-15T10:05:00Z'
            },
            {
                billNumber: '1003', customerName: 'Charlie', items: [{ name: 'Salad', quantity: 1 }], status: 'preparing',
                orderType: 'App', paymentMode: 'Wallet', createdAt: '2025-09-15T10:10:00Z'
            },
            {
        billNumber: '1004', customerName: 'Dan', items: [{ name: 'Sushi', quantity: 1 }], status: 'pending',
                orderType: 'Manual', paymentMode: 'Cash', createdAt: '2025-09-15T10:15:00Z'
            },
            {
                billNumber: '1005', customerName: 'Eve', items: [{ name: 'Taco', quantity: 2 }], status: 'pending',
                orderType: 'App', paymentMode: 'Card', createdAt: '2025-09-15T10:20:00Z'
            }
        ],
        total: 5,
        currentPage: 1
    };

    const searchOrderMock = {
        order: {
            orderId: '1002',
            customerName: 'Bob Johnson',
            items: [
                { id: 1, productName: 'Burger', quantity: 1, unitPrice: 10, totalPrice: 10, itemStatus: 'pending' },
                { id: 2, productName: 'Fries', quantity: 1, unitPrice: 5, totalPrice: 5, itemStatus: 'pending' },
            ],
            orderStatus: 'pending',
            totalPrice: 15,
            createdAt: '2025-09-15T10:05:00Z',
            outletName: 'Main Street Outlet'
        }
    };

    beforeEach(() => {
        // Intercept all API calls with our mock data
        cy.intercept('GET', 'http://51.21.198.214:5500/api/staff/outlets/get-home-data/', homeDataMock).as('getHomeData');
        cy.intercept('GET', 'http://51.21.198.214:5500/api/staff/tickets/count/', { count: 5 }).as('getTicketsCount');
        cy.intercept('GET', 'http://51.21.198.214:5500/api/staff/outlets/get-recent-orders/1/?page=1&limit=10', recentOrdersMock).as('getRecentOrders');
        cy.intercept('GET', '/staff/outlets/get-order/outlet-1002', { statusCode: 200, body: searchOrderMock.order }).as('searchOrderSuccess');
        cy.intercept('GET', '/staff/outlets/get-order/outlet-9999', { statusCode: 404, body: { message: 'Order not found' } }).as('searchOrderNotFound');
        cy.intercept('PUT', '/staff/outlets/update-order/', { statusCode: 200, body: { message: 'Order updated successfully' } }).as('updateOrder');
        
        // Mock the `useOutletDetails` hook to provide a consistent `outletId`.
        cy.window().then(win => {
            cy.stub(win, 'useOutletDetails').returns({ outletId: 'outlet-1002' });
        });

        cy.visit('/signin');
        cy.get('input[name="email"]').type(validData.email);
        cy.get('input[name="password"]').type(validData.password);
        cy.get('button[type="submit"]').click();
        cy.wait(['@getHomeData', '@getRecentOrders']);
    });

    // --- 1. UI and Data Display Tests ---
    it('should display the main dashboard sections and stats', () => {
        cy.get('h2').contains('Overview').should('be.visible');
        cy.get('h2').contains('Recent Orders').should('be.visible');

        // Verify stat cards
        cy.get('h2').contains('₹55,200').should('be.visible');
        cy.get('h2').contains('150').should('be.visible'); // App Orders
        cy.get('h2').contains('50').should('be.visible'); // Manual Orders
        cy.get('h2').contains('5').should('be.visible'); // Tickets Raised
        cy.get('h2').contains('Burger').should('be.visible'); // Best Seller
    });

    it('should populate the recent orders table correctly', () => {
        cy.get('table').should('be.visible');
        cy.get('th').contains('Order ID').should('be.visible');
        cy.get('th').contains('Customer').should('be.visible');

        cy.get('tbody tr').should('have.length', 5);
        cy.get('tbody tr').first().find('td').first().should('contain.text', '#1001');
    });

    // --- 2. Order Look-Up & Actions Tests ---
    it('should successfully search for an order and display details', () => {
        cy.get('input[placeholder="Enter Order ID"]').type('#1002{enter}');
        
        cy.get('h4').contains('#1002').should('be.visible');
        cy.get('p').contains('Bob Johnson').should('be.visible');
        cy.get('span').contains('PENDING').should('be.visible');
        cy.get('.space-y-2').should('contain.text', 'Burger');
        cy.get('.space-y-2').should('contain.text', 'Fries');
        cy.get('span').contains('Total:').next().should('contain.text', '₹ 15.00');
    });

    it('should show "Order Not Found" for a non-existent order ID', () => {
        cy.get('input[placeholder="Enter Order ID"]').type('#9999{enter}');
        cy.get('p').contains('Order Not Found').should('be.visible');
        cy.get('.text-red-400').contains('❌').should('be.visible');
    });

    it('should mark all items as delivered via the modal', () => {
        // First, search for a pending order
        cy.get('input[placeholder="Enter Order ID"]').type('#1002{enter}');
        cy.wait('@searchOrderSuccess');

        // Select all items
        cy.get('.space-y-2').find('input[type="checkbox"]').each(checkbox => {
            cy.wrap(checkbox).check();
        });

        // Click the 'Mark All Delivered' button
        cy.get('button').contains('Mark All Delivered').should('be.enabled').click();

        // Verify the modal is open
        cy.get('h2').contains('Mark All Delivered').should('be.visible');

        // Click the confirm button in the modal
        cy.get('button').contains('Confirm').click();

        // Intercept the API call and verify the payload
        cy.wait('@updateOrder').its('request.body').should('deep.include', {
            orderId: 1002,
            outletId: 'outlet-1002',
            status: 'DELIVERED',
            orderItemIds: [1, 2]
        });

        // Verify the UI reflects the change (re-fetches the data and shows a completed message)
        cy.get('.bg-green-50').contains('This order has been delivered successfully!').should('be.visible');
    });

    // --- 3. Pagination & Search Tests ---
    it('should filter recent orders by search query', () => {
        cy.get('input[placeholder="Search by ID or Customer..."]').type('Bob');
        cy.get('tbody tr').should('have.length', 1);
        cy.get('tbody tr').first().find('td').eq(1).should('contain.text', 'Bob');

        cy.get('input[placeholder="Search by ID or Customer..."]').clear().type('1003');
        cy.get('tbody tr').should('have.length', 1);
        cy.get('tbody tr').first().find('td').eq(0).should('contain.text', '#1003');
    });

    it('should navigate to the next and previous pages', () => {
        // Mock a response for page 2
        cy.intercept('GET', '/staff/outlets/get-recent-orders/?page=2&limit=10', {
            orders: [{
                billNumber: '1006', customerName: 'Frank', items: [{ name: 'Sandwich', quantity: 1 }], status: 'pending',
                orderType: 'App', paymentMode: 'Cash', createdAt: '2025-09-15T11:00:00Z'
            }],
            total: 6,
            currentPage: 2
        }).as('getPage2');
        
        // Wait for the button to be enabled before clicking.
        cy.get('button').contains('>').should('be.enabled').click();
        cy.wait('@getPage2');
        cy.get('span').contains('Page 2 of 2').should('be.visible'); 
        cy.get('tbody tr').should('have.length', 1);
        cy.get('tbody tr').first().find('td').first().should('contain.text', '#1006');
        
        // Go back to the first page
        cy.get('button').contains('<').should('be.enabled').click();
        cy.wait('@getRecentOrders');
        cy.get('tbody tr').should('have.length', 5);
        cy.get('span').contains('Page 1 of 2').should('be.visible');
    });
});

