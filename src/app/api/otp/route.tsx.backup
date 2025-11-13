import { Database } from "@/database/db";
import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import Otp from "@/Schema/otp.Schema";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

export async function POST(req: NextRequest) {
    const { location } = await req.json();

    // Set CORS headers
    const headers = {
        "Access-Control-Allow-Origin": "*", // Allow all origins (you can restrict to specific domain)
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    try {
        var otp = Math.floor(100000 + Math.random() * 900000);

        // Database connection and OTP creation
        await Database();
        await Otp.create({
            Name: "name",
            Phone: 9521688016,
            Otp: otp,
            OtpExpire: new Date(Date.now() + 300000),
        });

        const phoneNumber = `+919521688016`;
        console.log(location);
        let helpMessage = `Some One in your area need your Sahaara https://www.google.com/maps?q=${location.latitude},${location.longitude}`;

        // Sending SMS using Twilio
        const message = await client.messages.create({
            body: helpMessage,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phoneNumber,
        });

        console.log("Help sent successfully", message.sid);
        await Otp.deleteOne({ Phone: 9521688016 });

        return new NextResponse(JSON.stringify({ status: 200, message: "Help sent successfully" }), { headers });
    } catch (error) {
        console.error("Help fetch error:", error);
        return new NextResponse(JSON.stringify({ status: 500, message: "Help fetch error" }), { headers });
    }
}

// Handle OPTIONS method (for preflight CORS requests)
export async function OPTIONS() {
    const headers = {
        "Access-Control-Allow-Origin": "*", // Adjust this to your domain if needed
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };
    return new NextResponse(null, { headers });
}
