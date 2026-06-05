import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const maleNames = ['Aarav', 'Vihaan', 'Aditya', 'Sai', 'Arjun', 'Kabir', 'Rohan', 'Dhruv', 'Yash', 'Rahul', 'Karan', 'Vikram', 'Rishi', 'Kunal', 'Sahil', 'Varun', 'Nitin', 'Sanjay', 'Amit', 'Raj'];
const femaleNames = ['Aanya', 'Diya', 'Ananya', 'Saanvi', 'Kavya', 'Neha', 'Pooja', 'Riya', 'Snigdha', 'Isha', 'Meera', 'Rachna', 'Shruti', 'Tanvi', 'Anjali', 'Simran', 'Priya', 'Nisha', 'Aarti', 'Aditi'];
const lastNames = ['Sharma', 'Verma', 'Gupta', 'Patel', 'Singh', 'Kumar', 'Joshi', 'Mehta', 'Reddy', 'Rao', 'Nair', 'Iyer', 'Desai', 'Chopra', 'Bhat', 'Jain', 'Shah', 'Aggarwal', 'Chauhan', 'Yadav'];

const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad'];
const professions = [
  { title: 'Software Engineer', incomeRange: [8, 35] },
  { title: 'Data Scientist', incomeRange: [10, 40] },
  { title: 'Product Manager', incomeRange: [15, 50] },
  { title: 'Investment Banker', incomeRange: [20, 80] },
  { title: 'Doctor', incomeRange: [12, 45] },
  { title: 'CA', incomeRange: [10, 30] },
  { title: 'Business Analyst', incomeRange: [7, 25] },
  { title: 'Marketing Manager', incomeRange: [8, 28] }
];
const colleges = ['IIT Delhi', 'IIT Bombay', 'IIM Ahmedabad', 'BITS Pilani', 'NIT Trichy', 'Delhi University', 'Manipal University', 'VIT Vellore'];
const degrees = ['B.Tech', 'M.Tech', 'MBA', 'MBBS', 'CA', 'BBA', 'B.Com', 'M.Sc'];
const diets = ['Vegetarian', 'Non-Vegetarian', 'Eggetarian', 'Vegan'];
const maritalStatuses = ['Never Married', 'Divorced', 'Widowed', 'Awaiting Divorce'];

function getRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateProfile(gender: 'Male' | 'Female') {
  const firstName = gender === 'Male' ? getRandom(maleNames) : getRandom(femaleNames);
  const lastName = getRandom(lastNames);
  
  // Age between 24 and 35
  const age = getRandomInt(24, 35);
  const dob = new Date();
  dob.setFullYear(dob.getFullYear() - age);
  
  const profession = getRandom(professions);
  const income = getRandomInt(profession.incomeRange[0], profession.incomeRange[1]) * 100000;
  
  const height = gender === 'Male' ? getRandomInt(165, 185) : getRandomInt(152, 172);

  return {
    firstName,
    lastName,
    gender,
    dob,
    age,
    city: getRandom(cities),
    country: 'India',
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${getRandomInt(1, 999)}@example.com`,
    phone: `+919${getRandomInt(100000000, 999999999)}`,
    height,
    college: getRandom(colleges),
    degree: getRandom(degrees),
    company: 'Tech/Fin/Health Corp',
    designation: profession.title,
    income,
    maritalStatus: Math.random() > 0.8 ? getRandom(maritalStatuses.slice(1)) : 'Never Married',
    siblings: getRandomInt(0, 3),
    religion: 'Hindu',
    caste: 'General',
    languages: 'English, Hindi',
    wantKids: Math.random() > 0.2,
    openToRelocate: Math.random() > 0.3,
    openToPets: Math.random() > 0.5,
    diet: getRandom(diets),
    smoking: Math.random() > 0.8 ? 'Occasionally' : 'No',
    drinking: Math.random() > 0.6 ? 'Socially' : 'No',
    hobbies: 'Reading, Traveling, Movies',
    familyType: Math.random() > 0.6 ? 'Joint' : 'Nuclear',
    personalityType: Math.random() > 0.5 ? 'Introvert' : 'Extrovert',
    horoscope: 'Cancer',
    manglik: Math.random() > 0.8 ? 'Yes' : 'No',
    partnerExpectations: 'Looking for a compatible and understanding partner.',
    statusTag: 'Active'
  };
}

async function main() {
  console.log('Cleaning up existing data...');
  await prisma.match.deleteMany();
  await prisma.note.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  console.log('Creating matchmaker user...');
  const hashedPassword = await bcrypt.hash('password123', 10);
  await prisma.user.create({
    data: {
      name: 'TDC Matchmaker',
      email: 'matchmaker@tdc.com',
      password: hashedPassword
    }
  });

  console.log('Generating profiles...');
  const profiles = [];
  for (let i = 0; i < 100; i++) {
    profiles.push(generateProfile('Male'));
    profiles.push(generateProfile('Female'));
  }

  console.log(`Inserting ${profiles.length} profiles...`);
  await prisma.customer.createMany({
    data: profiles
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
