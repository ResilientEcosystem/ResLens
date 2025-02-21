"use client";

import React from "react";
import Navbar from "@/components/ui/navbar";
import { AuthorCard } from "@/components/Authors/Authorcard";
import Footer from "../ui/footer";

const authors = [
  {
    name: "Harish Krishnakumar Gokul",
    description:
      "Mastermind behind the architecture, middleware development, and seamless integration of profiling tools to ensure system efficiency.",
    imageSrc: "H.jpeg",
    LinkedinHandle: "harish-gokul01",
    GithubHandle: "harish876",
    title: "Tech Janitor",
  },
  {
    name: "Bismanpal Singh Anand",
    description:
      "Harmonized the design, user experience, and backend systems to create intuitive, data-driven interfaces and seamlessly integrated dashboards.",
    imageSrc: "B.jpg",
    LinkedinHandle: "bismanpal-singh",
    GithubHandle: "bismanpal-singh",
    title: "Full-Stack Maestro",
  },
  {
    name: "Georgy Zeats",
    description:
      "Led experimentation and integration of the database on edge devices, such as Raspberry Pi, enhancing distributed system capabilities.",
    imageSrc: "G.jpg",
    LinkedinHandle: "georgy-zaets",
    GithubHandle: "georgyzeats",
    title: "Edge Explorer",
  },
  {
    name: "Krishna Karthik",
    description:
      "Focused on frontend design, polishing the user interface and improving the visual experience across the platform.",
    imageSrc: "K.jpg",
    LinkedinHandle: "krishna-karthik-97b74b222",
    GithubHandle: "krishnakarthik",
    title: "Pixel Polisher",
  },
];

export default function AuthorsPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0c0c0c" }}>
      <Navbar />
      <main className="container mx-auto px-4 py-8 pt-20">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-white">
          The Geeks.
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {authors.map((author, index) => (
            <div key={index} className="flex justify-center">
              <AuthorCard {...author} />
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
