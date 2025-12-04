export const relationshipDate = new Date("2023-01-01"); // Replace with actual date

export const notes = [
    {
        id: 1,
        title: "Sana İlk Mektubum",
        date: "2023-02-14",
        content: "Sevgilim, seninle tanıştığım gün hayatımın değiştiğini hissetmiştim. Her geçen gün sana olan sevgim katlanarak artıyor. İyi ki varsın.",
    },
    {
        id: 2,
        title: "Özlem Dolu Bir Not",
        date: "2023-08-20",
        content: "Bugün seni çok özledim. Kokun burnumda tütüyor. Yanında olamasam da kalbim hep seninle.",
    },
];

export const calendarEvents = [
    {
        date: new Date(2023, 0, 1), // Jan 1
        title: "Tanışma Yıldönümü",
        type: "anniversary",
    },
    {
        date: new Date(2023, 1, 14), // Feb 14
        title: "Sevgililer Günü",
        type: "special",
    },
    {
        date: new Date(1998, 5, 15), // Example birthday
        title: "Doğum Günün",
        type: "birthday",
    },
];

export const memories = [
    {
        id: 1,
        title: "İlk Buluşmamız",
        date: "2023-01-01",
        description: "Hayatımın en güzel gününün başlangıcı. O gün giydiğin elbiseyi asla unutmayacağım.",
        image: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=2000&auto=format&fit=crop", // Placeholder
    },
    {
        id: 2,
        title: "İlk Tatilimiz",
        date: "2023-06-15",
        description: "Deniz, kum, güneş ve sen. Daha ne isteyebilirim ki?",
        image: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?q=80&w=2000&auto=format&fit=crop",
    },
    {
        id: 3,
        title: "Yılbaşı 2024",
        date: "2023-12-31",
        description: "Yeni yıla seninle girmek, bütün bir yılın harika geçeceğinin kanıtıydı.",
        image: "https://images.unsplash.com/photo-1546272983-64eb30d5d31d?q=80&w=2000&auto=format&fit=crop",
    },
];

export const quotes = [
    "Seninle geçen her an, ömrüme ömür katıyor.",
    "Gözlerinin içine baktığımda dünyayı görüyorum.",
    "Seni seviyorum, çünkü bütün evren sana ulaşmam için işbirliği yaptı.",
    "Sen benim en güzel tesadüfüm değil, en güzel tercihimsin.",
];

export const games = [
    {
        id: "quiz",
        title: "Bizi Ne Kadar Tanıyorsun?",
        description: "İlişkimiz hakkında eğlenceli bir test.",
        icon: "HelpCircle",
        href: "/games/quiz",
    },
    {
        id: "puzzle",
        title: "Aşk Yapbozu",
        description: "Birlikte tamamlamamız gereken bir parça.",
        icon: "Puzzle",
        href: "/games/puzzle",
    },
];

export const quizQuestions = [
    {
        id: 1,
        question: "İlk buluşmamızda ne yemiştik?",
        options: ["Hamburger", "Pizza", "Sushi", "Sadece kahve içtik"],
        correctAnswer: 3, // Index of correct answer
    },
    {
        id: 2,
        question: "Benim en sevdiğim renk hangisi?",
        options: ["Mavi", "Yeşil", "Kırmızı", "Siyah"],
        correctAnswer: 0,
    },
    {
        id: 3,
        question: "Sana ilk ne zaman 'Seni Seviyorum' dedim?",
        options: ["İlk buluşmada", "Bir ay sonra", "Yılbaşında", "Doğum gününde"],
        correctAnswer: 1,
    },
    {
        id: 4,
        question: "Bizim şarkımız hangisi?",
        options: ["Perfect - Ed Sheeran", "All of Me - John Legend", "Aşkın Olayım", "Beni Çok Sev"],
        correctAnswer: 0,
    },
];
