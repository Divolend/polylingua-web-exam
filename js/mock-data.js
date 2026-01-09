// Mock data for demonstration if API is unavailable

const MOCK_COURSES = [
    {
        id: 1,
        name: "Introduction to Russian language",
        description: "A beginner course on Russian language learning. Perfect for those starting their journey into the beautiful Russian language and culture.",
        teacher: "Viktor Sergeevich",
        level: "Beginner",
        total_length: 8,
        week_length: 2,
        start_dates: [
            "2025-02-01T09:00:00",
            "2025-02-01T14:00:00",
            "2025-02-01T17:00:00",
            "2025-03-01T09:00:00",
            "2025-03-01T14:00:00"
        ],
        course_fee_per_hour: 200,
        created_at: "2025-01-05T17:30:00"
    },
    {
        id: 2,
        name: "Advanced Spanish for Professionals",
        description: "A comprehensive course for professionals looking to enhance their Spanish skills. Advanced level with business focus.",
        teacher: "Luisa Martinez",
        level: "Advanced",
        total_length: 12,
        week_length: 3,
        start_dates: [
            "2025-02-15T10:00:00",
            "2025-02-15T18:00:00",
            "2025-03-15T10:00:00",
            "2025-03-15T14:00:00"
        ],
        course_fee_per_hour: 220,
        created_at: "2025-01-05T17:30:00"
    },
    {
        id: 3,
        name: "French Conversation for Beginners",
        description: "Learn basic French conversation skills in a fun environment. Perfect for travelers and beginners.",
        teacher: "Pierre Dupont",
        level: "Beginner",
        total_length: 6,
        week_length: 2,
        start_dates: [
            "2025-02-01T12:00:00",
            "2025-03-01T12:00:00",
            "2025-03-01T16:00:00"
        ],
        course_fee_per_hour: 180,
        created_at: "2025-01-05T17:30:00"
    },
    {
        id: 4,
        name: "Japanese Language and Culture",
        description: "An introductory course covering basic Japanese language and cultural nuances. Learn to read, write and speak Japanese.",
        teacher: "Akiko Tanaka",
        level: "Beginner",
        total_length: 10,
        week_length: 2,
        start_dates: [
            "2025-02-10T10:00:00",
            "2025-02-10T15:00:00",
            "2025-03-10T10:00:00"
        ],
        course_fee_per_hour: 250,
        created_at: "2025-01-05T17:30:00"
    },
    {
        id: 5,
        name: "Italian Culinary Language Course",
        description: "Master Italian culinary terms and expressions for cooking. Perfect for food enthusiasts and chefs.",
        teacher: "Marco Rossi",
        level: "Beginner",
        total_length: 8,
        week_length: 1,
        start_dates: [
            "2025-02-20T14:00:00",
            "2025-03-20T14:00:00"
        ],
        course_fee_per_hour: 210,
        created_at: "2025-01-05T17:30:00"
    },
    {
        id: 6,
        name: "Intermediate German for Everyday Communication",
        description: "A course designed to improve your German communication skills, focusing on everyday situations, grammar and vocabulary.",
        teacher: "Anna Müller",
        level: "Intermediate",
        total_length: 10,
        week_length: 2,
        start_dates: [
            "2025-02-05T11:00:00",
            "2025-02-05T18:00:00",
            "2025-03-05T11:00:00"
        ],
        course_fee_per_hour: 230,
        created_at: "2025-01-05T17:30:00"
    },
    {
        id: 7,
        name: "Intensive Business English Bootcamp",
        description: "A fast-paced, immersive course focused on business communication, negotiations, presentations, and professional writing.",
        teacher: "James Wilson",
        level: "Advanced",
        total_length: 40,
        week_length: 10,
        start_dates: [
            "2025-02-01T09:00:00",
            "2025-03-01T09:00:00"
        ],
        course_fee_per_hour: 350,
        created_at: "2025-01-05T17:30:00"
    },
    {
        id: 8,
        name: "Mandarin Chinese Full Immersion",
        description: "A comprehensive course for serious learners, covering all aspects of Mandarin: characters, grammar, pronunciation, and conversation.",
        teacher: "Li Wei",
        level: "Intermediate",
        total_length: 60,
        week_length: 6,
        start_dates: [
            "2025-02-10T10:00:00",
            "2025-03-10T10:00:00"
        ],
        course_fee_per_hour: 280,
        created_at: "2025-01-05T17:30:00"
    },
    {
        id: 9,
        name: "IELTS/TOEFL Exam Preparation Crash Course",
        description: "A focused, high-intensity course designed to maximize your score on international English proficiency exams.",
        teacher: "Sarah Johnson",
        level: "Advanced",
        total_length: 30,
        week_length: 7,
        start_dates: [
            "2025-02-15T09:00:00",
            "2025-02-15T18:00:00",
            "2025-03-15T09:00:00"
        ],
        course_fee_per_hour: 320,
        created_at: "2025-01-05T17:30:00"
    }
];

const MOCK_TUTORS = [
    {
        id: 1,
        name: "Irina Petrovna",
        work_experience: 5,
        languages_spoken: ["English", "Spanish", "Russian"],
        languages_offered: ["Russian", "English"],
        language_level: "Advanced",
        price_per_hour: 500
    },
    {
        id: 2,
        name: "John Smith",
        work_experience: 8,
        languages_spoken: ["English", "French"],
        languages_offered: ["English"],
        language_level: "Advanced",
        price_per_hour: 600
    },
    {
        id: 3,
        name: "Anna Kowalski",
        work_experience: 3,
        languages_spoken: ["Polish", "English", "German"],
        languages_offered: ["Polish", "German"],
        language_level: "Intermediate",
        price_per_hour: 400
    },
    {
        id: 4,
        name: "Carlos Rodriguez",
        work_experience: 10,
        languages_spoken: ["Spanish", "English", "Portuguese"],
        languages_offered: ["Spanish", "Portuguese"],
        language_level: "Advanced",
        price_per_hour: 550
    },
    {
        id: 5,
        name: "Yuki Tanaka",
        work_experience: 4,
        languages_spoken: ["Japanese", "English"],
        languages_offered: ["Japanese"],
        language_level: "Intermediate",
        price_per_hour: 450
    },
    {
        id: 6,
        name: "Pierre Dubois",
        work_experience: 7,
        languages_spoken: ["French", "English", "Italian"],
        languages_offered: ["French", "Italian"],
        language_level: "Advanced",
        price_per_hour: 520
    }
];