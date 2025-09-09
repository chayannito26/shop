import type { CartItem } from '../contexts/CartContext';

// IMPORTANT: Storing API tokens in client-side code is a major security risk.
// It is highly recommended to use a server-side function to send emails.
// This implementation is for demonstration purposes only.

const API_URL = "https://api.zeptomail.com/v1.1/email";
// Replace with your actual ZeptoMail token.
// Consider using environment variables for better security, but be aware
// that they will still be bundled with your client-side code.
const TOKEN = "Zoho-enczapikey wSsVR60jrBP3W691zmeqde9qyAwHDl3/Ekl60FqjunP/GqyWpcdolkLJUQLzGPZKEG46RTsV97wgyh4IgzRf2o8tmQ1SWiiF9mqRe1U4J3x17qnvhDzOVmRdlRKALIILxg5umWZoE8oh+g==";

interface EmailAddress {
    address: string;
    name: string;
}

interface ToAddress {
    email_address: EmailAddress;
}

interface SendMailPayload {
    from: {
        address: string;
        name: string;
    };
    to: ToAddress[];
    subject: string;
    htmlbody: string;
}

export const sendOrderConfirmationEmail = async (customerEmail: string, customerName: string, orderDetails: CartItem[]) => {
    // if (TOKEN === "YOUR_ZEPTOMAIL_TOKEN") {
    //     console.warn("ZeptoMail token is not configured. Skipping email sending.");
    //     return;
    // }

    const payload: SendMailPayload = {
        from: {
            address: "shop@chayannito26.com",
            name: "Chayannito 26 Shop"
        },
        to: [
            {
                email_address: {
                    address: customerEmail,
                    name: customerName
                }
            }
        ],
        subject: "Your Chayannito 26 Shop Order Confirmation",
        htmlbody: `<div>
            <h2>Thank you for your order, ${customerName}!</h2>
            <p>We've received your order and will process it shortly.</p>
            <h3>Order Details:</h3>
            <pre>${JSON.stringify(orderDetails, null, 2)}</pre>
            <p>Thank you for shopping with us!</p>
        </div>`
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': TOKEN
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            console.log("Order confirmation email sent successfully.");
        } else {
            const errorData = await response.json();
            console.error("Failed to send order confirmation email:", errorData);
        }
    } catch (error) {
        console.error("Error sending order confirmation email:", error);
    }
};
