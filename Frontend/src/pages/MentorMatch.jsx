// src/pages/MentorMatch.jsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Clock } from "lucide-react";
// import MentorMatchForm from "@/components/MentorMatchForm";

const MentorMatch = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <HeroBanner />

      <section className="max-w-6xl mx-auto px-4 py-12">
        <MentorMatchForm />

        <AvailableMentorsList />

        <ScheduleSection />
      </section>
    </div>
  );
};

// 🌟 Hero Banner
const HeroBanner = () => (
  <section className="bg-gradient-to-r from-pink-200 via-purple-100 to-blue-100 py-16 text-center">
    <h1 className="text-4xl font-bold mb-4">Find Your Mentor</h1>
    <p className="text-lg text-gray-700 max-w-2xl mx-auto">
      Connect with inspiring women mentors ready to guide you in your journey — education, career, entrepreneurship, and more.
    </p>
  </section>
);

// 🧑‍🏫 Available Mentors List
const AvailableMentorsList = () => {
  const mentors = [
    {
      name: "Asha Verma",
      field: "Business Coach",
      bio: "10+ years helping women start small businesses in rural areas.",
    },
    {
      name: "Neha Joshi",
      field: "Digital Literacy Mentor",
      bio: "Trained 500+ students in using internet tools for learning.",
    },
    {
      name: "Ritika Sharma",
      field: "Health & Wellness",
      bio: "Empowering women with health education & resources.",
    },
  ];

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-semibold mb-6">Available Mentors</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mentors.map((mentor, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>{mentor.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{mentor.field}</p>
            </CardHeader>
            <CardContent>
              <p>{mentor.bio}</p>
              <Button className="mt-4 w-full">Request Session</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// 📅 Schedule Section
const ScheduleSection = () => {
  const [date, setDate] = React.useState(new Date());

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-semibold mb-6">Schedule a Session</h2>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
        </div>
        <div>
          <p className="font-medium mb-2">Select a Time Slot</p>
          <div className="grid grid-cols-2 gap-3">
            {["10:00 AM", "11:30 AM", "2:00 PM", "4:00 PM"].map((slot, idx) => (
              <Button variant="outline" key={idx} className="flex items-center gap-2">
                <Clock size={16} />
                {slot}
              </Button>
            ))}
          </div>
          <Button className="mt-6 w-full">Confirm Booking</Button>
        </div>
      </div>
    </div>
  );
};

export default MentorMatch;
