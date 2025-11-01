// =================================================================
// 1. تعريف المنهج (Curriculum)
// =================================================================

// المنهج المحدّث للحفظ
const HifzCurriculum = [
    // الأحقاف
    { surah: 'الأحقاف', start_ayah: 1, end_ayah: 5, points: 5, type: 'hifz', label: 'الأحقاف (1-5)' },
    { surah: 'الأحقاف', start_ayah: 6, end_ayah: 10, points: 5, type: 'hifz', label: 'الأحقاف (6-10)' },
    { surah: 'الأحقاف', start_ayah: 11, end_ayah: 14, points: 5, type: 'hifz', label: 'الأحقاف (11-14)' },
    { surah: 'الأحقاف', start_ayah: 15, end_ayah: 16, points: 5, type: 'hifz', label: 'الأحقاف (15-16)' },
    { surah: 'الأحقاف', start_ayah: 17, end_ayah: 20, points: 5, type: 'hifz', label: 'الأحقاف (17-20)' },
    { surah: 'الأحقاف', start_ayah: 21, end_ayah: 25, points: 5, type: 'hifz', label: 'الأحقاف (21-25)' },
    { surah: 'الأحقاف', start_ayah: 26, end_ayah: 28, points: 5, type: 'hifz', label: 'الأحقاف (26-28)' },
    { surah: 'الأحقاف', start_ayah: 29, end_ayah: 32, points: 5, type: 'hifz', label: 'الأحقاف (29-32)' },
    { surah: 'الأحقاف', start_ayah: 33, end_ayah: 35, points: 5, type: 'hifz', label: 'الأحقاف (33-35)' },
    // محمد
    { surah: 'محمد', start_ayah: 1, end_ayah: 6, points: 5, type: 'hifz', label: 'محمد (1-6)' }, // Index 9
    { surah: 'محمد', start_ayah: 7, end_ayah: 11, points: 5, type: 'hifz', label: 'محمد (7-11)' },
    { surah: 'محمد', start_ayah: 12, end_ayah: 15, points: 5, type: 'hifz', label: 'محمد (12-15)' },
    { surah: 'محمد', start_ayah: 16, end_ayah: 19, points: 5, type: 'hifz', label: 'محمد (16-19)' },
    { surah: 'محمد', start_ayah: 20, end_ayah: 24, points: 5, type: 'hifz', label: 'محمد (20-24)' },
    { surah: 'محمد', start_ayah: 25, end_ayah: 29, points: 5, type: 'hifz', label: 'محمد (25-29)' },
    { surah: 'محمد', start_ayah: 30, end_ayah: 34, points: 5, type: 'hifz', label: 'محمد (30-34)' },
    { surah: 'محمد', start_ayah: 35, end_ayah: 38, points: 5, type: 'hifz', label: 'محمد (35-38)' },
    // الفتح
    { surah: 'الفتح', start_ayah: 1, end_ayah: 5, points: 5, type: 'hifz', label: 'الفتح (1-5)' }, // Index 17
    { surah: 'الفتح', start_ayah: 6, end_ayah: 9, points: 5, type: 'hifz', label: 'الفتح (6-9)' },
    { surah: 'الفتح', start_ayah: 10, end_ayah: 13, points: 5, type: 'hifz', label: 'الفتح (10-13)' },
    { surah: 'الفتح', start_ayah: 14, end_ayah: 15, points: 5, type: 'hifz', label: 'الفتح (14-15)' },
    { surah: 'الفتح', start_ayah: 16, end_ayah: 19, points: 5, type: 'hifz', label: 'الفتح (16-19)' },
    { surah: 'الفتح', start_ayah: 20, end_ayah: 23, points: 5, type: 'hifz', label: 'الفتح (20-23)' },
    { surah: 'الفتح', start_ayah: 24, end_ayah: 26, points: 5, type: 'hifz', label: 'الفتح (24-26)' },
    { surah: 'الفتح', start_ayah: 27, end_ayah: 28, points: 5, type: 'hifz', label: 'الفتح (27-28)' },
    { surah: 'الفتح', start_ayah: 29, end_ayah: 29, points: 5, type: 'hifz', label: 'الفتح (29-29)' },
    // الحجرات
    { surah: 'الحجرات', start_ayah: 1, end_ayah: 4, points: 5, type: 'hifz', label: 'الحجرات (1-4)' }, // Index 26
    { surah: 'الحجرات', start_ayah: 5, end_ayah: 8, points: 5, type: 'hifz', label: 'الحجرات (5-8)' },
    { surah: 'الحجرات', start_ayah: 9, end_ayah: 11, points: 5, type: 'hifz', label: 'الحجرات (9-11)' },
    { surah: 'الحجرات', start_ayah: 12, end_ayah: 14, points: 5, type: 'hifz', label: 'الحجرات (12-14)' },
    { surah: 'الحجرات', start_ayah: 15, end_ayah: 18, points: 5, type: 'hifz', label: 'الحجرات (15-18)' },
    // ق
    { surah: 'ق', start_ayah: 1, end_ayah: 8, points: 5, type: 'hifz', label: 'ق (1-8)' }, // Index 31
    { surah: 'ق', start_ayah: 9, end_ayah: 15, points: 5, type: 'hifz', label: 'ق (9-15)' },
    { surah: 'ق', start_ayah: 16, end_ayah: 30, points: 5, type: 'hifz', label: 'ق (16-30)' },
    { surah: 'ق', start_ayah: 31, end_ayah: 38, points: 5, type: 'hifz', label: 'ق (31-38)' },
    { surah: 'ق', start_ayah: 39, end_ayah: 45, points: 5, type: 'hifz', label: 'ق (39-45)' },
    // الذاريات
    { surah: 'الذاريات', start_ayah: 1, end_ayah: 23, points: 5, type: 'hifz', label: 'الذاريات (1-23)' }, // Index 36
    { surah: 'الذاريات', start_ayah: 24, end_ayah: 30, points: 5, type: 'hifz', label: 'الذاريات (24-30)' },
    { surah: 'الذاريات', start_ayah: 31, end_ayah: 42, points: 5, type: 'hifz', label: 'الذاريات (31-42)' },
    { surah: 'الذاريات', start_ayah: 43, end_ayah: 51, points: 5, type: 'hifz', label: 'الذاريات (43-51)' },
    { surah: 'الذاريات', start_ayah: 52, end_ayah: 60, points: 5, type: 'hifz', label: 'الذاريات (52-60)' },
    // الطور
    { surah: 'الطور', start_ayah: 1, end_ayah: 14, points: 5, type: 'hifz', label: 'الطور (1-14)' }, // Index 41
    { surah: 'الطور', start_ayah: 15, end_ayah: 23, points: 5, type: 'hifz', label: 'الطور (15-23)' },
    { surah: 'الطور', start_ayah: 24, end_ayah: 31, points: 5, type: 'hifz', label: 'الطور (24-31)' },
    { surah: 'الطور', start_ayah: 32, end_ayah: 43, points: 5, type: 'hifz', label: 'الطور (32-43)' },
    { surah: 'الطور', start_ayah: 44, end_ayah: 49, points: 5, type: 'hifz', label: 'الطور (44-49)' },
    // النجم
    { surah: 'النجم', start_ayah: 1, end_ayah: 18, points: 5, type: 'hifz', label: 'النجم (1-18)' }, // Index 46
    { surah: 'النجم', start_ayah: 19, end_ayah: 26, points: 5, type: 'hifz', label: 'النجم (19-26)' },
    { surah: 'النجم', start_ayah: 27, end_ayah: 32, points: 5, type: 'hifz', label: 'النجم (27-32)' },
    { surah: 'النجم', start_ayah: 33, end_ayah: 44, points: 5, type: 'hifz', label: 'النجم (33-44)' },
    { surah: 'النجم', start_ayah: 45, end_ayah: 62, points: 5, type: 'hifz', label: 'النجم (45-62)' },
    // القمر
    { surah: 'القمر', start_ayah: 1, end_ayah: 8, points: 5, type: 'hifz', label: 'القمر (1-8)' }, // Index 51
    { surah: 'القمر', start_ayah: 9, end_ayah: 22, points: 5, type: 'hifz', label: 'القمر (9-22)' },
    { surah: 'القمر', start_ayah: 23, end_ayah: 32, points: 5, type: 'hifz', label: 'القمر (23-32)' },
    { surah: 'القمر', start_ayah: 33, end_ayah: 42, points: 5, type: 'hifz', label: 'القمر (33-42)' },
    { surah: 'القمر', start_ayah: 43, end_ayah: 55, points: 5, type: 'hifz', label: 'القمر (43-55)' },
    // الرحمن
    { surah: 'الرحمن', start_ayah: 1, end_ayah: 18, points: 5, type: 'hifz', label: 'الرحمن (1-18)' }, // Index 56
    { surah: 'الرحمن', start_ayah: 19, end_ayah: 32, points: 5, type: 'hifz', label: 'الرحمن (19-32)' },
    { surah: 'الرحمن', start_ayah: 33, end_ayah: 45, points: 5, type: 'hifz', label: 'الرحمن (33-45)' },
    { surah: 'الرحمن', start_ayah: 46, end_ayah: 61, points: 5, type: 'hifz', label: 'الرحمن (46-61)' },
    { surah: 'الرحمن', start_ayah: 62, end_ayah: 78, points: 5, type: 'hifz', label: 'الرحمن (62-78)' },
    // الواقعة
    { surah: 'الواقعة', start_ayah: 1, end_ayah: 16, points: 5, type: 'hifz', label: 'الواقعة (1-16)' }, // Index 61
    { surah: 'الواقعة', start_ayah: 17, end_ayah: 40, points: 5, type: 'hifz', label: 'الواقعة (17-40)' },
    { surah: 'الواقعة', start_ayah: 41, end_ayah: 57, points: 5, type: 'hifz', label: 'الواقعة (41-57)' },
    { surah: 'الواقعة', start_ayah: 58, end_ayah: 74, points: 5, type: 'hifz', label: 'الواقعة (58-74)' },
    { surah: 'الواقعة', start_ayah: 75, end_ayah: 96, points: 5, type: 'hifz', label: 'الواقعة (75-96)' },
    // الحديد
    { surah: 'الحديد', start_ayah: 1, end_ayah: 6, points: 5, type: 'hifz', label: 'الحديد (1-6)' }, // Index 66
    { surah: 'الحديد', start_ayah: 7, end_ayah: 11, points: 5, type: 'hifz', label: 'الحديد (7-11)' },
    { surah: 'الحديد', start_ayah: 12, end_ayah: 15, points: 5, type: 'hifz', label: 'الحديد (12-15)' },
    { surah: 'الحديد', start_ayah: 16, end_ayah: 18, points: 5, type: 'hifz', label: 'الحديد (16-18)' },
    { surah: 'الحديد', start_ayah: 19, end_ayah: 20, points: 5, type: 'hifz', label: 'الحديد (19-20)' },
    { surah: 'الحديد', start_ayah: 21, end_ayah: 24, points: 5, type: 'hifz', label: 'الحديد (21-24)' },
    { surah: 'الحديد', start_ayah: 25, end_ayah: 27, points: 5, type: 'hifz', label: 'الحديد (25-27)' },
    { surah: 'الحديد', start_ayah: 28, end_ayah: 29, points: 5, type: 'hifz', label: 'الحديد (28-29)' },
    // المجادلة
    { surah: 'المجادلة', start_ayah: 1, end_ayah: 2, points: 5, type: 'hifz', label: 'المجادلة (1-2)' }, // Index 74
    { surah: 'المجادلة', start_ayah: 3, end_ayah: 4, points: 5, type: 'hifz', label: 'المجادلة (3-4)' },
    { surah: 'المجادلة', start_ayah: 5, end_ayah: 6, points: 5, type: 'hifz', label: 'المجادلة (5-6)' },
    { surah: 'المجادلة', start_ayah: 7, end_ayah: 8, points: 5, type: 'hifz', label: 'المجادلة (7-8)' },
    { surah: 'المجادلة', start_ayah: 9, end_ayah: 10, points: 5, type: 'hifz', label: 'المجادلة (9-10)' },
    { surah: 'المجادلة', start_ayah: 11, end_ayah: 12, points: 5, type: 'hifz', label: 'المجادلة (11-12)' },
    { surah: 'المجادلة', start_ayah: 13, end_ayah: 16, points: 5, type: 'hifz', label: 'المجادلة (13-16)' },
    { surah: 'المجادلة', start_ayah: 17, end_ayah: 19, points: 5, type: 'hifz', label: 'المجادلة (17-19)' },
    { surah: 'المجادلة', start_ayah: 20, end_ayah: 22, points: 5, type: 'hifz', label: 'المجادلة (20-22)' }, // **تم تصحيح الآية 4 إلى 22 هنا**
    // الحشر
    { surah: 'الحشر', start_ayah: 1, end_ayah: 3, points: 5, type: 'hifz', label: 'الحشر (1-3)' }, // Index 83
    { surah: 'الحشر', start_ayah: 4, end_ayah: 6, points: 5, type: 'hifz', label: 'الحشر (4-6)' },
    { surah: 'الحشر', start_ayah: 7, end_ayah: 8, points: 5, type: 'hifz', label: 'الحشر (7-8)' },
    { surah: 'الحشر', start_ayah: 9, end_ayah: 10, points: 5, type: 'hifz', label: 'الحشر (9-10)' },
    { surah: 'الحشر', start_ayah: 11, end_ayah: 12, points: 5, type: 'hifz', label: 'الحشر (11-12)' },
    { surah: 'الحشر', start_ayah: 13, end_ayah: 14, points: 5, type: 'hifz', label: 'الحشر (13-14)' },
    { surah: 'الحشر', start_ayah: 15, end_ayah: 19, points: 5, type: 'hifz', label: 'الحشر (15-19)' },
    { surah: 'الحشر', start_ayah: 20, end_ayah: 24, points: 5, type: 'hifz', label: 'الحشر (20-24)' },
    // الممتحنة
    { surah: 'الممتحنة', start_ayah: 1, end_ayah: 2, points: 5, type: 'hifz', label: 'الممتحنة (1-2)' }, // Index 91
    { surah: 'الممتحنة', start_ayah: 3, end_ayah: 4, points: 5, type: 'hifz', label: 'الممتحنة (3-4)' },
    { surah: 'الممتحنة', start_ayah: 5, end_ayah: 7, points: 5, type: 'hifz', label: 'الممتحنة (5-7)' },
    { surah: 'الممتحنة', start_ayah: 8, end_ayah: 9, points: 5, type: 'hifz', label: 'الممتحنة (8-9)' },
    { surah: 'الممتحنة', start_ayah: 10, end_ayah: 11, points: 5, type: 'hifz', label: 'الممتحنة (10-11)' },
    { surah: 'الممتحنة', start_ayah: 12, end_ayah: 13, points: 5, type: 'hifz', label: 'الممتحنة (12-13)' },
    // الصف
    { surah: 'الصف', start_ayah: 1, end_ayah: 4, points: 5, type: 'hifz', label: 'الصف (1-4)' }, // Index 97
    { surah: 'الصف', start_ayah: 5, end_ayah: 6, points: 5, type: 'hifz', label: 'الصف (5-6)' },
    { surah: 'الصف', start_ayah: 7, end_ayah: 9, points: 5, type: 'hifz', label: 'الصف (7-9)' },
    { surah: 'الصف', start_ayah: 10, end_ayah: 13, points: 5, type: 'hifz', label: 'الصف (10-13)' },
    { surah: 'الصف', start_ayah: 14, end_ayah: 14, points: 5, type: 'hifz', label: 'الصف (14-14)' },
    // الجمعة
    { surah: 'الجمعة', start_ayah: 1, end_ayah: 3, points: 5, type: 'hifz', label: 'الجمعة (1-3)' }, // Index 102
    { surah: 'الجمعة', start_ayah: 4, end_ayah: 5, points: 5, type: 'hifz', label: 'الجمعة (4-5)' },
    { surah: 'الجمعة', start_ayah: 6, end_ayah: 8, points: 5, type: 'hifz', label: 'الجمعة (6-8)' },
    { surah: 'الجمعة', start_ayah: 9, end_ayah: 11, points: 5, type: 'hifz', label: 'الجمعة (9-11)' },
    // المنافقون
    { surah: 'المنافقون', start_ayah: 1, end_ayah: 3, points: 5, type: 'hifz', label: 'المنافقون (1-3)' }, // Index 106
    { surah: 'المنافقون', start_ayah: 4, end_ayah: 5, points: 5, type: 'hifz', label: 'المنافقون (4-5)' },
    { surah: 'المنافقون', start_ayah: 6, end_ayah: 7, points: 5, type: 'hifz', label: 'المنافقون (6-7)' },
    { surah: 'المنافقون', start_ayah: 8, end_ayah: 9, points: 5, type: 'hifz', label: 'المنافقون (8-9)' },
    { surah: 'المنافقون', start_ayah: 10, end_ayah: 11, points: 5, type: 'hifz', label: 'المنافقون (10-11)' },
    // التغابن
    { surah: 'التغابن', start_ayah: 1, end_ayah: 4, points: 5, type: 'hifz', label: 'التغابن (1-4)' }, // Index 111
    { surah: 'التغابن', start_ayah: 5, end_ayah: 7, points: 5, type: 'hifz', label: 'التغابن (5-7)' },
    { surah: 'التغابن', start_ayah: 8, end_ayah: 9, points: 5, type: 'hifz', label: 'التغابن (8-9)' },
    { surah: 'التغابن', start_ayah: 10, end_ayah: 13, points: 5, type: 'hifz', label: 'التغابن (10-13)' },
    { surah: 'التغابن', start_ayah: 14, end_ayah: 15, points: 5, type: 'hifz', label: 'التغابن (14-15)' },
    { surah: 'التغابن', start_ayah: 16, end_ayah: 18, points: 5, type: 'hifz', label: 'التغابن (16-18)' },
    // الطلاق
    { surah: 'الطلاق', start_ayah: 1, end_ayah: 2, points: 5, type: 'hifz', label: 'الطلاق (1-2)' }, // Index 117
    { surah: 'الطلاق', start_ayah: 3, end_ayah: 5, points: 5, type: 'hifz', label: 'الطلاق (3-5)' },
    { surah: 'الطلاق', start_ayah: 6, end_ayah: 9, points: 5, type: 'hifz', label: 'الطلاق (6-9)' },
    { surah: 'الطلاق', start_ayah: 10, end_ayah: 11, points: 5, type: 'hifz', label: 'الطلاق (10-11)' },
    { surah: 'الطلاق', start_ayah: 12, end_ayah: 12, points: 5, type: 'hifz', label: 'الطلاق (12-12)' },
    // التحريم
    { surah: 'التحريم', start_ayah: 1, end_ayah: 3, points: 5, type: 'hifz', label: 'التحريم (1-3)' }, // Index 122
    { surah: 'التحريم', start_ayah: 4, end_ayah: 5, points: 5, type: 'hifz', label: 'التحريم (4-5)' },
    { surah: 'التحريم', start_ayah: 6, end_ayah: 7, points: 5, type: 'hifz', label: 'التحريم (6-7)' },
    { surah: 'التحريم', start_ayah: 8, end_ayah: 10, points: 5, type: 'hifz', label: 'التحريم (8-10)' },
    { surah: 'التحريم', start_ayah: 11, end_ayah: 12, points: 5, type: 'hifz', label: 'التحريم (11-12)' },
    // الملك
    { surah: 'الملك', start_ayah: 1, end_ayah: 5, points: 5, type: 'hifz', label: 'الملك (1-5)' }, // Index 127
    { surah: 'الملك', start_ayah: 6, end_ayah: 12, points: 5, type: 'hifz', label: 'الملك (6-12)' },
    { surah: 'الملك', start_ayah: 13, end_ayah: 19, points: 5, type: 'hifz', label: 'الملك (13-19)' },
    { surah: 'الملك', start_ayah: 20, end_ayah: 26, points: 5, type: 'hifz', label: 'الملك (20-26)' },
    { surah: 'الملك', start_ayah: 27, end_ayah: 30, points: 5, type: 'hifz', label: 'الملك (27-30)' },
    // القلم
    { surah: 'القلم', start_ayah: 1, end_ayah: 9, points: 5, type: 'hifz', label: 'القلم (1-9)' }, // Index 132
    { surah: 'القلم', start_ayah: 10, end_ayah: 16, points: 5, type: 'hifz', label: 'القلم (10-16)' },
    { surah: 'القلم', start_ayah: 17, end_ayah: 27, points: 5, type: 'hifz', label: 'القلم (17-27)' },
    { surah: 'القلم', start_ayah: 28, end_ayah: 33, points: 5, type: 'hifz', label: 'القلم (28-33)' },
    { surah: 'القلم', start_ayah: 34, end_ayah: 42, points: 5, type: 'hifz', label: 'القلم (34-42)' },
    { surah: 'القلم', start_ayah: 43, end_ayah: 47, points: 5, type: 'hifz', label: 'القلم (43-47)' },
    { surah: 'القلم', start_ayah: 48, end_ayah: 52, points: 5, type: 'hifz', label: 'القلم (48-52)' },
    // الحاقة
    { surah: 'الحاقة', start_ayah: 1, end_ayah: 8, points: 5, type: 'hifz', label: 'الحاقة (1-8)' }, // Index 139
    { surah: 'الحاقة', start_ayah: 9, end_ayah: 18, points: 5, type: 'hifz', label: 'الحاقة (9-18)' },
    { surah: 'الحاقة', start_ayah: 19, end_ayah: 24, points: 5, type: 'hifz', label: 'الحاقة (19-24)' },
    { surah: 'الحاقة', start_ayah: 25, end_ayah: 35, points: 5, type: 'hifz', label: 'الحاقة (25-35)' },
    { surah: 'الحاقة', start_ayah: 36, end_ayah: 43, points: 5, type: 'hifz', label: 'الحاقة (36-43)' },
    { surah: 'الحاقة', start_ayah: 44, end_ayah: 52, points: 5, type: 'hifz', label: 'الحاقة (44-52)' },
    // المعارج
    { surah: 'المعارج', start_ayah: 1, end_ayah: 10, points: 5, type: 'hifz', label: 'المعارج (1-10)' }, // Index 145
    { surah: 'المعارج', start_ayah: 11, end_ayah: 18, points: 5, type: 'hifz', label: 'المعارج (11-18)' },
    { surah: 'المعارج', start_ayah: 19, end_ayah: 28, points: 5, type: 'hifz', label: 'المعارج (19-28)' },
    { surah: 'المعارج', start_ayah: 29, end_ayah: 35, points: 5, type: 'hifz', label: 'المعارج (29-35)' },
    { surah: 'المعارج', start_ayah: 36, end_ayah: 40, points: 5, type: 'hifz', label: 'المعارج (36-40)' },
    { surah: 'المعارج', start_ayah: 41, end_ayah: 44, points: 5, type: 'hifz', label: 'المعارج (41-44)' },
    // نوح
    { surah: 'نوح', start_ayah: 1, end_ayah: 4, points: 5, type: 'hifz', label: 'نوح (1-4)' }, // Index 151
    { surah: 'نوح', start_ayah: 5, end_ayah: 10, points: 5, type: 'hifz', label: 'نوح (5-10)' },
    { surah: 'نوح', start_ayah: 11, end_ayah: 20, points: 5, type: 'hifz', label: 'نوح (11-20)' },
    { surah: 'نوح', start_ayah: 21, end_ayah: 25, points: 5, type: 'hifz', label: 'نوح (21-25)' },
    { surah: 'نوح', start_ayah: 26, end_ayah: 28, points: 5, type: 'hifz', label: 'نوح (26-28)' },
    // الجن
    { surah: 'الجن', start_ayah: 1, end_ayah: 4, points: 5, type: 'hifz', label: 'الجن (1-4)' }, // Index 156
    { surah: 'الجن', start_ayah: 5, end_ayah: 8, points: 5, type: 'hifz', label: 'الجن (5-8)' },
    { surah: 'الجن', start_ayah: 9, end_ayah: 11, points: 5, type: 'hifz', label: 'الجن (9-11)' },
    { surah: 'الجن', start_ayah: 12, end_ayah: 14, points: 5, type: 'hifz', label: 'الجن (12-14)' },
    { surah: 'الجن', start_ayah: 15, end_ayah: 19, points: 5, type: 'hifz', label: 'الجن (15-19)' },
    { surah: 'الجن', start_ayah: 20, end_ayah: 23, points: 5, type: 'hifz', label: 'الجن (20-23)' },
    { surah: 'الجن', start_ayah: 24, end_ayah: 28, points: 5, type: 'hifz', label: 'الجن (24-28)' },
    // المزمل
    { surah: 'المزمل', start_ayah: 1, end_ayah: 8, points: 5, type: 'hifz', label: 'المزمل (1-8)' }, // Index 163
    { surah: 'المزمل', start_ayah: 9, end_ayah: 14, points: 5, type: 'hifz', label: 'المزمل (9-14)' },
    { surah: 'المزمل', start_ayah: 15, end_ayah: 19, points: 5, type: 'hifz', label: 'المزمل (15-19)' },
    { surah: 'المزمل', start_ayah: 20, end_ayah: 20, points: 5, type: 'hifz', label: 'المزمل (20-20)' },
    // المدثر
    { surah: 'المدثر', start_ayah: 1, end_ayah: 10, points: 5, type: 'hifz', label: 'المدثر (1-10)' }, // Index 167
    { surah: 'المدثر', start_ayah: 11, end_ayah: 18, points: 5, type: 'hifz', label: 'المدثر (11-18)' },
    { surah: 'المدثر', start_ayah: 19, end_ayah: 30, points: 5, type: 'hifz', label: 'المدثر (19-30)' },
    { surah: 'المدثر', start_ayah: 31, end_ayah: 41, points: 5, type: 'hifz', label: 'المدثر (31-41)' },
    { surah: 'المدثر', start_ayah: 42, end_ayah: 47, points: 5, type: 'hifz', label: 'المدثر (42-47)' },
    { surah: 'المدثر', start_ayah: 48, end_ayah: 56, points: 5, type: 'hifz', label: 'المدثر (48-56)' },
    // القيامة
    { surah: 'القيامة', start_ayah: 1, end_ayah: 10, points: 5, type: 'hifz', label: 'القيامة (1-10)' }, // Index 173
    { surah: 'القيامة', start_ayah: 11, end_ayah: 19, points: 5, type: 'hifz', label: 'القيامة (11-19)' },
    { surah: 'القيامة', start_ayah: 20, end_ayah: 33, points: 5, type: 'hifz', label: 'القيامة (20-33)' },
    { surah: 'القيامة', start_ayah: 34, end_ayah: 40, points: 5, type: 'hifz', label: 'القيامة (34-40)' },
    // الإنسان
    { surah: 'الإنسان', start_ayah: 1, end_ayah: 5, points: 5, type: 'hifz', label: 'الإنسان (1-5)' }, // Index 177
    { surah: 'الإنسان', start_ayah: 6, end_ayah: 12, points: 5, type: 'hifz', label: 'الإنسان (6-12)' },
    { surah: 'الإنسان', start_ayah: 13, end_ayah: 18, points: 5, type: 'hifz', label: 'الإنسان (13-18)' },
    { surah: 'الإنسان', start_ayah: 19, end_ayah: 23, points: 5, type: 'hifz', label: 'الإنسان (19-23)' },
    { surah: 'الإنسان', start_ayah: 24, end_ayah: 28, points: 5, type: 'hifz', label: 'الإنسان (24-28)' },
    { surah: 'الإنسان', start_ayah: 29, end_ayah: 31, points: 5, type: 'hifz', label: 'الإنسان (29-31)' },
    // المرسلات
    { surah: 'المرسلات', start_ayah: 1, end_ayah: 15, points: 5, type: 'hifz', label: 'المرسلات (1-15)' }, // Index 183
    { surah: 'المرسلات', start_ayah: 16, end_ayah: 24, points: 5, type: 'hifz', label: 'المرسلات (16-24)' },
    { surah: 'المرسلات', start_ayah: 25, end_ayah: 28, points: 5, type: 'hifz', label: 'المرسلات (25-28)' },
    { surah: 'المرسلات', start_ayah: 29, end_ayah: 34, points: 5, type: 'hifz', label: 'المرسلات (29-34)' },
    { surah: 'المرسلات', start_ayah: 35, end_ayah: 40, points: 5, type: 'hifz', label: 'المرسلات (35-40)' },
    { surah: 'المرسلات', start_ayah: 41, end_ayah: 50, points: 5, type: 'hifz', label: 'المرسلات (41-50)' }, // Index 188 - **تم تصحيح العدد الإجمالي إلى 188 مقطع (0 إلى 187)**
];

// المنهج المحدّث للمراجعة
const MurajaaCurriculum = [
    // الأحقاف (مقسمة)
    { surah: 'الأحقاف', label: 'مراجعة الأحقاف (1-16)', points: 3, type: 'murajaa', hifz_start_index: 0, hifz_end_index: 3 }, // تم تصحيح النهاية لتوافق عدد المقاطع (4)
    { surah: 'الأحقاف', label: 'مراجعة الأحقاف (17-35)', points: 3, type: 'murajaa', hifz_start_index: 4, hifz_end_index: 8 }, 
    // محمد (مقسمة)
    { surah: 'محمد', label: 'مراجعة محمد (1-19)', points: 3, type: 'murajaa', hifz_start_index: 9, hifz_end_index: 12 }, 
    { surah: 'محمد', label: 'مراجعة محمد (20-38)', points: 3, type: 'murajaa', hifz_start_index: 13, hifz_end_index: 16 }, 
    // الفتح (مقسمة)
    { surah: 'الفتح', label: 'مراجعة الفتح (1-15)', points: 3, type: 'murajaa', hifz_start_index: 17, hifz_end_index: 21 }, 
    { surah: 'الفتح', label: 'مراجعة الفتح (16-29)', points: 3, type: 'murajaa', hifz_start_index: 22, hifz_end_index: 25 }, 
    // الحجرات (كاملة)
    { surah: 'الحجرات', label: 'مراجعة الحجرات (كاملة)', points: 3, type: 'murajaa', hifz_start_index: 26, hifz_end_index: 30 }, 
    // ق (كاملة)
    { surah: 'ق', label: 'مراجعة ق (كاملة)', points: 3, type: 'murajaa', hifz_start_index: 31, hifz_end_index: 35 },
    // الذاريات (كاملة)
    { surah: 'الذاريات', label: 'مراجعة الذاريات (كاملة)', points: 3, type: 'murajaa', hifz_start_index: 36, hifz_end_index: 40 },
    // الطور (كاملة)
    { surah: 'الطور', label: 'مراجعة الطور (كاملة)', points: 3, type: 'murajaa', hifz_start_index: 41, hifz_end_index: 45 },
    // النجم (كاملة)
    { surah: 'النجم', label: 'مراجعة النجم (كاملة)', points: 3, type: 'murajaa', hifz_start_index: 46, hifz_end_index: 50 },
    // القمر (كاملة)
    { surah: 'القمر', label: 'مراجعة القمر (كاملة)', points: 3, type: 'murajaa', hifz_start_index: 51, hifz_end_index: 55 },
    // الرحمن (كاملة)
    { surah: 'الرحمن', label: 'مراجعة الرحمن (كاملة)', points: 3, type: 'murajaa', hifz_start_index: 56, hifz_end_index: 60 },
    // الواقعة (كاملة)
    { surah: 'الواقعة', label: 'مراجعة الواقعة (كاملة)', points: 3, type: 'murajaa', hifz_start_index: 61, hifz_end_index: 65 },
    // الحديد (مقسمة)
    { surah: 'الحديد', label: 'مراجعة الحديد (1-18)', points: 3, type: 'murajaa', hifz_start_index: 66, hifz_end_index: 69 },
    { surah: 'الحديد', label: 'مراجعة الحديد (19-29)', points: 3, type: 'murajaa', hifz_start_index: 70, hifz_end_index: 73 },
    // المجادلة (مقسمة)
    { surah: 'المجادلة', label: 'مراجعة المجادلة (1-12)', points: 3, type: 'murajaa', hifz_start_index: 74, hifz_end_index: 79 },
    { surah: 'المجادلة', label: 'مراجعة المجادلة (13-22)', points: 3, type: 'murajaa', hifz_start_index: 80, hifz_end_index: 82 },
    // الحشر (مقسمة)
    { surah: 'الحشر', label: 'مراجعة الحشر (1-12)', points: 3, type: 'murajaa', hifz_start_index: 83, hifz_end_index: 87 }, // تم تصحيح النهاية لتوافق عدد المقاطع (5)
    { surah: 'الحشر', label: 'مراجعة الحشر (13-24)', points: 3, type: 'murajaa', hifz_start_index: 88, hifz_end_index: 90 }, 
    // الممتحنة (مقسمة)
    { surah: 'الممتحنة', label: 'مراجعة الممتحنة (1-7)', points: 3, type: 'murajaa', hifz_start_index: 91, hifz_end_index: 93 },
    { surah: 'الممتحنة', label: 'مراجعة الممتحنة (8-13)', points: 3, type: 'murajaa', hifz_start_index: 94, hifz_end_index: 96 },
    // الصف (كاملة)
    { surah: 'الصف', label: 'مراجعة الصف (كاملة)', points: 3, type: 'murajaa', hifz_start_index: 97, hifz_end_index: 101 },
    // الجمعة (كاملة)
    { surah: 'الجمعة', label: 'مراجعة الجمعة (كاملة)', points: 3, type: 'murajaa', hifz_start_index: 102, hifz_end_index: 105 },
    // المنافقون (كاملة)
    { surah: 'المنافقون', label: 'مراجعة المنافقون (كاملة)', points: 3, type: 'murajaa', hifz_start_index: 106, hifz_end_index: 110 },
    // التغابن (كاملة)
    { surah: 'التغابن', label: 'مراجعة التغابن (كاملة)', points: 3, type: 'murajaa', hifz_start_index: 111, hifz_end_index: 116 },
    // الطلاق (كاملة)
    { surah: 'الطلاق', label: 'مراجعة الطلاق (كاملة)', points: 3, type: 'murajaa', hifz_start_index: 117, hifz_end_index: 121 },
    // التحريم (كاملة)
    { surah: 'التحريم', label: 'مراجعة التحريم (كاملة)', points: 3, type: 'murajaa', hifz_start_index: 122, hifz_end_index: 126 },
    // الملك (كاملة)
    { surah: 'الملك', label: 'مراجعة الملك (كاملة)', points: 3, type: 'murajaa', hifz_start_index: 127, hifz_end_index: 131 },
    // القلم (كاملة)
    { surah: 'القلم', label: 'مراجعة القلم (كاملة)', points: 3, type: 'murajaa', hifz_start_index: 132, hifz_end_index: 138 },
    // الحاقة (كاملة)
    { surah: 'الحاقة', label: 'مراجعة الحاقة (كاملة)', points: 3, type: 'murajaa', hifz_start_index: 139, hifz_end_index: 144 },
    // المعارج (كاملة)
    { surah: 'المعارج', label: 'مراجعة المعارج (كاملة)', points: 3, type: 'murajaa', hifz_start_index: 145, hifz_end_index: 150 },
    // نوح (كاملة)
    { surah: 'نوح', label: 'مراجعة نوح (كاملة)', points: 3, type: 'murajaa', hifz_start_index: 151, hifz_end_index: 155 },
    // الجن (كاملة)
    { surah: 'الجن', label: 'مراجعة الجن (كاملة)', points: 3, type: 'murajaa', hifz_start_index: 156, hifz_end_index: 162 },
    // المزمل (كاملة)
    { surah: 'المزمل', label: 'مراجعة المزمل (كاملة)', points: 3, type: 'murajaa', hifz_start_index: 163, hifz_end_index: 166 },
    // المدثر (كاملة)
    { surah: 'المدثر', label: 'مراجعة المدثر (كاملة)', points: 3, type: 'murajaa', hifz_start_index: 167, hifz_end_index: 172 },
    // القيامة (كاملة)
    { surah: 'القيامة', label: 'مراجعة القيامة (كاملة)', points: 3, type: 'murajaa', hifz_start_index: 173, hifz_end_index: 176 },
    // الإنسان (كاملة)
    { surah: 'الإنسان', label: 'مراجعة الإنسان (كاملة)', points: 3, type: 'murajaa', hifz_start_index: 177, hifz_end_index: 182 },
    // المرسلات (كاملة)
    { surah: 'المرسلات', label: 'مراجعة المرسلات (كاملة)', points: 3, type: 'murajaa', hifz_start_index: 183, hifz_end_index: 188 }, // الاندكس الأخير هو 187، لذا النهاية هي 188 لتشمل الكل
    // السور التي تلي المرسلات (يجب أن يتم تحديث مصفوفة HifzCurriculum لتشملها لاحقاً)
    { surah: 'النبأ', label: 'مراجعة النبأ (كاملة)', points: 3, type: 'murajaa', hifz_start_index: 188, hifz_end_index: 188 }, 
    { surah: 'النازعات', label: 'مراجعة النازعات (كاملة)', points: 3, type: 'murajaa', hifz_start_index: 188, hifz_end_index: 188 },
    { surah: 'عبس والتكوير', label: 'مراجعة عبس والتكوير', points: 3, type: 'murajaa', hifz_start_index: 188, hifz_end_index: 188 },
    { surah: 'الإنفطار والمطففين', label: 'مراجعة الإنفطار والمطففين', points: 3, type: 'murajaa', hifz_start_index: 188, hifz_end_index: 188 },
    { surah: 'الإنشقاق والبروج', label: 'مراجعة الإنشقاق والبروج', points: 3, type: 'murajaa', hifz_start_index: 188, hifz_end_index: 188 },
    { surah: 'الطارق إلى الفجر', label: 'مراجعة الطارق إلى الفجر', points: 3, type: 'murajaa', hifz_start_index: 188, hifz_end_index: 188 },
    { surah: 'البلد إلى الناس', label: 'مراجعة البلد إلى الناس', points: 3, type: 'murajaa', hifz_start_index: 188, hifz_end_index: 188 },
];

const CURRICULUM = [...HifzCurriculum, ...MurajaaCurriculum];


// =================================================================
// 2. إعداد Firebase (Configuration)
// =================================================================

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCeIcmuTd72sjiu1Uyijn_J4bMS0ChtXGo",
  authDomain: "studenttasksmanager.firebaseapp.com",
  projectId: "studenttasksmanager",
  storageBucket: "studenttasksmanager.firebasestorage.app",
  messagingSenderId: "850350680089",
  appId: "1:850350680089:web:51b71a710e938754bc6288",
  measurementId: "G-7QC4FVXKZG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
// =================================================================
// 3. تعريف الأدوار (Roles) ورموز الدخول الأساسية (Initial Data)
// =================================================================

const TEACHER_CODE = 'TEACHER1'; // رمز الدخول الثابت للمعلم

// بيانات أولية (سيتم إنشاؤها إذا لم تكن موجودة)
const initialStudents = [
    {
        code: 'A101',
        name: 'أحمد السالم',
        role: 'student',
        points: 50,
        hifzProgress: 5, // يمثل فهرس المقطع الأخير المنجز في HifzCurriculum
        murajaaProgress: 2, // يمثل فهرس المقطع الأخير المنجز في MurajaaCurriculum
        hifzGoalStart: 0, // بداية هدف الـ Progress Bar (الأحقاف 1-5)
        hifzGoalEnd: 30, // نهاية هدف الـ Progress Bar (الحجرات 15-18)
    },
    {
        code: 'A102',
        name: 'خالد محمد',
        role: 'student',
        points: 80,
        hifzProgress: 15,
        murajaaProgress: 5,
        hifzGoalStart: 9, 
        hifzGoalEnd: 40,
    }
];

// =================================================================
// 4. متغيرات الحالة العامة (Global State)
// =================================================================

let currentUser = null;
let currentRole = null;
let studentsData = []; // لتخزين بيانات الطلاب النشطة

// =================================================================
// 5. وظائف واجهة المستخدم المساعدة (UI Helpers)
// =================================================================

/** إخفاء جميع الشاشات وعرض الشاشة المطلوبة فقط */
function showScreen(screenId) {
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('teacher-screen').classList.add('hidden');
    document.getElementById('student-screen').classList.add('hidden');
    document.getElementById(screenId).classList.remove('hidden');
}

/** عرض رسالة (نجاح/خطأ) في عنصر محدد */
function displayMessage(elementId, message, type = 'success') {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.className = `message ${type}`;
    element.classList.remove('hidden');
    setTimeout(() => {
        element.classList.add('hidden');
    }, 5000);
}

/** ملء قائمة Select بخيارات المنهج */
function populateCurriculumSelects() {
    const hifzStartSelect = document.getElementById('new-student-hifz-start');
    const murajaaStartSelect = document.getElementById('new-student-murajaa-start');
    const hifzGoalStartSelect = document.getElementById('new-student-hifz-goal-start');
    const hifzGoalEndSelect = document.getElementById('new-student-hifz-goal-end');

    [hifzStartSelect, hifzGoalStartSelect, hifzGoalEndSelect].forEach(select => select.innerHTML = '');
    murajaaStartSelect.innerHTML = '';
    
    // إضافة خيار البداية (0)
    hifzStartSelect.innerHTML += `<option value="-1">لم يبدأ الحفظ بعد</option>`;
    murajaaStartSelect.innerHTML += `<option value="-1">لم يبدأ المراجعة بعد</option>`;
    hifzGoalStartSelect.innerHTML += `<option value="-1">بداية المنهج</option>`;
    hifzGoalEndSelect.innerHTML += `<option value="${HifzCurriculum.length}">نهاية المنهج</option>`;

    HifzCurriculum.forEach((item, index) => {
        const optionText = `${item.label} (فهرس: ${index})`;
        hifzStartSelect.innerHTML += `<option value="${index}">${optionText}</option>`;
        hifzGoalStartSelect.innerHTML += `<option value="${index}">${optionText}</option>`;
        hifzGoalEndSelect.innerHTML += `<option value="${index}">${optionText}</option>`;
    });

    MurajaaCurriculum.forEach((item, index) => {
        murajaaStartSelect.innerHTML += `<option value="${index}">${item.label} (فهرس: ${index})</option>`;
    });
}

// =================================================================
// 6. وظائف تهيئة البيانات (Initialization)
// =================================================================

/** التحقق من وجود المعلم وإضافة البيانات الأولية إذا لزم الأمر */
async function initializeData() {
    try {
        // 1. إنشاء حساب المعلم الأساسي
        const teacherRef = db.collection('users').doc(TEACHER_CODE);
        await teacherRef.set({
            code: TEACHER_CODE,
            name: 'المعلم',
            role: 'teacher'
        }, { merge: true });

        // 2. التحقق من وجود الطلاب الأوليين وإضافتهم
        for (const student of initialStudents) {
            const studentDoc = await db.collection('users').doc(student.code).get();
            if (!studentDoc.exists) {
                await db.collection('users').doc(student.code).set(student);
            }
        }
        
        // 3. تهيئة قوائم المنهج في شاشة المعلم
        populateCurriculumSelects();
        populateAssignTaskSelects();
        renderCurriculumList('hifz'); // عرض منهج الحفظ كافتراضي

    } catch (error) {
        console.error("خطأ في تهيئة البيانات:", error);
    }
}

// =================================================================
// 7. وظائف المصادقة (Authentication)
// =================================================================

/** معالجة محاولة تسجيل الدخول */
async function handleLogin() {
    const code = document.getElementById('login-code').value.trim();
    if (!code) {
        displayMessage('auth-message', 'الرجاء إدخال رمز الدخول.', 'error');
        return;
    }

    // التحقق من المعلم
    if (code === TEACHER_CODE) {
        currentUser = { code, name: 'المعلم', role: 'teacher' };
        currentRole = 'teacher';
        showTeacherScreen();
        return;
    }

    // التحقق من الطالب
    try {
        const doc = await db.collection('users').doc(code).get();
        if (doc.exists && doc.data().role === 'student') {
            currentUser = doc.data();
            currentRole = 'student';
            showStudentScreen();
        } else {
            displayMessage('auth-message', 'رمز دخول غير صحيح أو غير مسجل كطالب.', 'error');
        }
    } catch (error) {
        console.error("خطأ في التحقق من الدخول:", error);
        displayMessage('auth-message', 'حدث خطأ أثناء الاتصال بالنظام.', 'error');
    }
}

/** معالجة تسجيل الخروج */
function handleLogout() {
    currentUser = null;
    currentRole = null;
    document.getElementById('login-code').value = '';
    showScreen('auth-screen');
}

// =================================================================
// 8. شاشة المعلم (Teacher Screen)
// =================================================================

function showTeacherScreen() {
    showScreen('teacher-screen');
    loadStudents();
    loadPendingTasks();
    loadLeaderboard();
    // تفعيل التبويبة الافتراضية
    document.querySelector('.tab-button[data-tab="manage-students"]').click();
}

/** تحميل بيانات الطلاب من Firebase */
function loadStudents() {
    db.collection('users').where('role', '==', 'student')
        .onSnapshot(snapshot => {
            studentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            renderStudentList();
            populateAssignTaskSelects(); // تحديث قائمة اختيار الطالب في تعيين المهام
        }, error => {
            console.error("خطأ في تحميل الطلاب:", error);
        });
}

/** عرض قائمة الطلاب في واجهة المعلم */
function renderStudentList() {
    const list = document.getElementById('student-list');
    list.innerHTML = '';
    if (studentsData.length === 0) {
        list.innerHTML = '<p>لا يوجد طلاب مسجلون بعد.</p>';
        return;
    }

    studentsData.forEach(student => {
        const hifzProgressItem = HifzCurriculum[student.hifzProgress];
        const murajaaProgressItem = MurajaaCurriculum[student.murajaaProgress];
        
        // حساب نسبة تقدم الحفظ المئوية
        let progressPercent = 0;
        const totalGoalSteps = student.hifzGoalEnd - student.hifzGoalStart;
        if (totalGoalSteps > 0) {
             const completedSteps = student.hifzProgress - student.hifzGoalStart;
             progressPercent = Math.min(100, Math.max(0, (completedSteps / totalGoalSteps) * 100));
        }

        const hifzDisplay = hifzProgressItem ? hifzProgressItem.label : 'لم يبدأ';
        const murajaaDisplay = murajaaProgressItem ? murajaaProgressItem.label : 'لم يبدأ';

        const item = document.createElement('li');
        item.className = 'student-item';
        item.innerHTML = `
            <div class="student-details">
                <h4>${student.name} (${student.code})</h4>
                <p><strong>النقاط:</strong> ${student.points || 0}</p>
                <p><strong>تقدم الحفظ:</strong> ${hifzDisplay} (فهرس: ${student.hifzProgress})</p>
                <p><strong>تقدم المراجعة:</strong> ${murajaaDisplay} (فهرس: ${student.murajaaProgress})</p>
                <div class="progress-bar-container" style="width: 100%; margin-top: 5px;">
                     <div class="progress-bar" style="width: ${progressPercent.toFixed(1)}%;">${progressPercent.toFixed(1)}%</div>
                </div>
            </div>
            <div class="student-actions">
                <button onclick="deleteStudent('${student.code}')" style="background-color: #dc3545;">حذف</button>
            </div>
        `;
        list.appendChild(item);
    });
}

/** إضافة طالب جديد */
async function addStudent() {
    const name = document.getElementById('new-student-name').value.trim();
    const code = document.getElementById('new-student-code').value.trim();
    const hifzStart = parseInt(document.getElementById('new-student-hifz-start').value);
    const murajaaStart = parseInt(document.getElementById('new-student-murajaa-start').value);
    const hifzGoalStart = parseInt(document.getElementById('new-student-hifz-goal-start').value);
    const hifzGoalEnd = parseInt(document.getElementById('new-student-hifz-goal-end').value);
    
    if (!name || !code) {
        displayMessage('add-student-message', 'الرجاء ملء حقل الاسم والرمز.', 'error');
        return;
    }
    
    if (hifzGoalStart >= hifzGoalEnd) {
        displayMessage('add-student-message', 'يجب أن يكون هدف النهاية أكبر من هدف البداية.', 'error');
        return;
    }

    try {
        const docRef = db.collection('users').doc(code);
        const doc = await docRef.get();
        if (doc.exists) {
            displayMessage('add-student-message', 'رمز الطالب موجود بالفعل. يرجى اختيار رمز آخر.', 'error');
            return;
        }

        await docRef.set({
            code: code,
            name: name,
            role: 'student',
            points: 0,
            hifzProgress: hifzStart, // استخدام القيمة المختارة كفهرس التقدم
            murajaaProgress: murajaaStart, // استخدام القيمة المختارة كفهرس التقدم
            hifzGoalStart: hifzGoalStart,
            hifzGoalEnd: hifzGoalEnd,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        displayMessage('add-student-message', `تمت إضافة الطالب ${name} بنجاح.`, 'success');
        document.getElementById('new-student-name').value = '';
        document.getElementById('new-student-code').value = '';

    } catch (error) {
        console.error("خطأ في إضافة الطالب:", error);
        displayMessage('add-student-message', 'حدث خطأ أثناء إضافة الطالب.', 'error');
    }
}

/** حذف طالب */
async function deleteStudent(code) {
    if (!confirm('هل أنت متأكد من حذف هذا الطالب وجميع بياناته؟')) return;

    try {
        await db.collection('users').doc(code).delete();
        // حذف المهام الخاصة بالطالب
        const tasksSnapshot = await db.collection('tasks').where('studentCode', '==', code).get();
        const batch = db.batch();
        tasksSnapshot.docs.forEach(doc => batch.delete(doc.ref));
        await batch.commit();

        displayMessage('manage-students-message', 'تم حذف الطالب ومهامه بنجاح.', 'success');
    } catch (error) {
        console.error("خطأ في حذف الطالب:", error);
        displayMessage('manage-students-message', 'حدث خطأ أثناء حذف الطالب.', 'error');
    }
}

/** ملء قوائم اختيار الطالب والمهمة في تبويبة "تعيين مهام" */
function populateAssignTaskSelects() {
    const studentSelect = document.getElementById('assign-task-student');
    const hifzSectionSelect = document.getElementById('hifz-section-select');
    const murajaaSectionSelect = document.getElementById('murajaa-section-select');
    
    studentSelect.innerHTML = '<option value="">اختر الطالب</option>';
    hifzSectionSelect.innerHTML = '';
    murajaaSectionSelect.innerHTML = '';

    studentsData.forEach(student => {
        studentSelect.innerHTML += `<option value="${student.code}">${student.name} (${student.code})</option>`;
    });

    HifzCurriculum.forEach((item, index) => {
        hifzSectionSelect.innerHTML += `<option value="${index}" data-points="${item.points}">${item.label} (فهرس: ${index})</option>`;
    });

    MurajaaCurriculum.forEach((item, index) => {
        murajaaSectionSelect.innerHTML += `<option value="${index}" data-points="${item.points}">${item.label} (فهرس: ${index})</option>`;
    });

    // إضافة مستمعي الأحداث لإظهار/إخفاء الحقول وتحديث الوصف والنقاط
    const taskTypeSelect = document.getElementById('assign-task-type');
    const descTextarea = document.getElementById('assign-task-description');
    const pointsInput = document.getElementById('assign-task-points');

    function updateTaskFields() {
        const taskType = taskTypeSelect.value;
        const hifzGroup = document.getElementById('hifz-section-select-group');
        const murajaaGroup = document.getElementById('murajaa-section-select-group');
        descTextarea.readOnly = false;
        pointsInput.value = 10;
        
        hifzGroup.style.display = 'none';
        murajaaGroup.style.display = 'none';
        descTextarea.value = '';

        if (taskType === 'hifz') {
            hifzGroup.style.display = 'block';
            descTextarea.readOnly = true;
            updateHifzDescription();
            hifzSectionSelect.onchange = updateHifzDescription;
        } else if (taskType === 'murajaa') {
            murajaaGroup.style.display = 'block';
            descTextarea.readOnly = true;
            updateMurajaaDescription();
            murajaaSectionSelect.onchange = updateMurajaaDescription;
        } else if (taskType === 'general') {
             pointsInput.value = 5;
             descTextarea.value = '';
        }
    }

    function updateHifzDescription() {
        const selectedIndex = parseInt(hifzSectionSelect.value);
        if (selectedIndex >= 0) {
            const item = HifzCurriculum[selectedIndex];
            descTextarea.value = `حفظ سورة ${item.surah} من آية ${item.start_ayah} إلى ${item.end_ayah}.`;
            pointsInput.value = item.points;
        }
    }

    function updateMurajaaDescription() {
        const selectedIndex = parseInt(murajaaSectionSelect.value);
        if (selectedIndex >= 0) {
            const item = MurajaaCurriculum[selectedIndex];
            descTextarea.value = `مراجعة ${item.label}.`;
            pointsInput.value = item.points;
        }
    }

    taskTypeSelect.onchange = updateTaskFields;

    // استدعاء للتأكد من الحالة الأولية الصحيحة
    updateTaskFields();
}

/** تعيين مهمة جديدة */
async function assignTask() {
    const studentCode = document.getElementById('assign-task-student').value;
    const taskType = document.getElementById('assign-task-type').value;
    const description = document.getElementById('assign-task-description').value.trim();
    const points = parseInt(document.getElementById('assign-task-points').value);
    
    if (!studentCode || !taskType || !description || isNaN(points) || points <= 0) {
        displayMessage('assign-tasks-message', 'الرجاء ملء جميع الحقول بشكل صحيح.', 'error');
        return;
    }

    let curriculumIndex = -1;
    let isHifzOrMurajaa = false;

    if (taskType === 'hifz') {
        curriculumIndex = parseInt(document.getElementById('hifz-section-select').value);
        if (isNaN(curriculumIndex) || curriculumIndex < 0) {
             displayMessage('assign-tasks-message', 'الرجاء اختيار مقطع حفظ صحيح.', 'error');
             return;
        }
        isHifzOrMurajaa = true;
    } else if (taskType === 'murajaa') {
        curriculumIndex = parseInt(document.getElementById('murajaa-section-select').value);
        if (isNaN(curriculumIndex) || curriculumIndex < 0) {
             displayMessage('assign-tasks-message', 'الرجاء اختيار مقطع مراجعة صحيح.', 'error');
             return;
        }
        isHifzOrMurajaa = true;
    }

    // التحقق من عدم تكرار مهمة الحفظ/المراجعة للطالب
    if (isHifzOrMurajaa) {
        const existingTask = await db.collection('tasks')
            .where('studentCode', '==', studentCode)
            .where('type', '==', taskType)
            .where('curriculumIndex', '==', curriculumIndex)
            .where('status', 'in', ['pending', 'assigned'])
            .get();

        if (existingTask.docs.length > 0) {
            displayMessage('assign-tasks-message', 'هذه المهمة (حفظ/مراجعة) معينة مسبقاً لهذا الطالب وقيد التنفيذ.', 'error');
            return;
        }
    }

    try {
        const newTask = {
            studentCode: studentCode,
            type: taskType,
            description: description,
            points: points,
            status: 'assigned', // assigned, pending, completed
            assignedAt: firebase.firestore.FieldValue.serverTimestamp(),
            curriculumIndex: curriculumIndex, // -1 for general, index for hifz/murajaa
        };

        await db.collection('tasks').add(newTask);
        displayMessage('assign-tasks-message', 'تم تعيين المهمة بنجاح.', 'success');
        
        // مسح الحقول بعد النجاح
        document.getElementById('assign-task-student').value = '';
        document.getElementById('assign-task-type').value = '';
        document.getElementById('assign-task-description').value = '';
        document.getElementById('assign-task-points').value = 10;
        
    } catch (error) {
        console.error("خطأ في تعيين المهمة:", error);
        displayMessage('assign-tasks-message', 'حدث خطأ أثناء تعيين المهمة.', 'error');
    }
}

/** تحميل وعرض المهام قيد المراجعة */
function loadPendingTasks() {
    db.collection('tasks').where('status', '==', 'pending')
        .onSnapshot(async snapshot => {
            const pendingTasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            // جلب أسماء الطلاب لكل مهمة
            const studentCodes = [...new Set(pendingTasks.map(task => task.studentCode))];
            const studentNames = {};
            if (studentCodes.length > 0) {
                 const studentDocs = await db.collection('users').where(firebase.firestore.FieldPath.documentId(), 'in', studentCodes).get();
                 studentDocs.forEach(doc => studentNames[doc.id] = doc.data().name);
            }

            renderPendingTasksList(pendingTasks, studentNames);
        }, error => {
            console.error("خطأ في تحميل المهام قيد المراجعة:", error);
        });
}

/** عرض قائمة المهام قيد المراجعة */
function renderPendingTasksList(tasks, studentNames) {
    const list = document.getElementById('pending-tasks-list');
    list.innerHTML = '';
    
    if (tasks.length === 0) {
        list.innerHTML = '<p>لا توجد مهام قيد المراجعة حاليًا.</p>';
        return;
    }

    tasks.forEach(task => {
        const studentName = studentNames[task.studentCode] || 'طالب غير معروف';
        const item = document.createElement('li');
        item.className = 'pending-task-item';
        item.innerHTML = `
            <div class="pending-task-details">
                <h4>الطالب: ${studentName} (${task.studentCode})</h4>
                <p><strong>النوع:</strong> ${task.type === 'hifz' ? 'حفظ' : task.type === 'murajaa' ? 'مراجعة' : 'عامة'}</p>
                <p><strong>المهمة:</strong> ${task.description}</p>
                <p><strong>النقاط المقترحة:</strong> ${task.points}</p>
            </div>
            <div class="pending-task-actions">
                <button onclick="approveTask('${task.id}', ${task.points}, '${task.studentCode}', '${task.type}', ${task.curriculumIndex})" 
                    style="background-color: #28a745;">موافقة واعتماد</button>
                <button onclick="rejectTask('${task.id}')" style="background-color: #ffc107;">رفض</button>
            </div>
        `;
        list.appendChild(item);
    });
}

/** معالجة الموافقة على مهمة (للمعلم) */
async function approveTask(taskId, points, studentCode, taskType, curriculumIndex) {
    try {
        const studentRef = db.collection('users').doc(studentCode);
        const studentDoc = await studentRef.get();

        if (studentDoc.exists) {
            const studentData = studentDoc.data();
            const batch = db.batch();

            // 1. تحديث حالة المهمة إلى "مكتملة"
            const taskRef = db.collection('tasks').doc(taskId);
            batch.update(taskRef, { status: 'completed', completedAt: firebase.firestore.FieldValue.serverTimestamp() });

            // 2. تحديث نقاط الطالب
            const newPoints = studentData.points + points;
            const updateData = { points: newPoints };

            // 3. تحديث تقدم الحفظ أو المراجعة إذا كانت المهمة من نوع curriculum
            if (taskType === 'hifz' && curriculumIndex >= 0) {
                // التأكد من أن التقدم الجديد أكبر من التقدم الحالي
                if (curriculumIndex > studentData.hifzProgress) {
                    updateData.hifzProgress = curriculumIndex;
                }
            } else if (taskType === 'murajaa' && curriculumIndex >= 0) {
                // التأكد من أن التقدم الجديد أكبر من التقدم الحالي
                 if (curriculumIndex > studentData.murajaaProgress) {
                    updateData.murajaaProgress = curriculumIndex;
                }
            }

            batch.update(studentRef, updateData);
            await batch.commit();

            displayMessage('pending-tasks-message', `تمت الموافقة على المهمة بنجاح وإضافة ${points} نقطة للطالب.`, 'success');
        } else {
            displayMessage('pending-tasks-message', 'خطأ: الطالب غير موجود.', 'error');
        }
    } catch (error) {
        console.error("خطأ في الموافقة على المهمة:", error);
        displayMessage('pending-tasks-message', 'حدث خطأ أثناء الموافقة على المهمة.', 'error');
    }
}

/** معالجة رفض مهمة (للمعلم) */
async function rejectTask(taskId) {
    if (!confirm('هل أنت متأكد من رفض هذه المهمة؟ سيتم إعادتها إلى الطالب كـ "مُعيّنة".')) return;
    try {
        await db.collection('tasks').doc(taskId).update({ status: 'assigned' });
        displayMessage('pending-tasks-message', 'تم رفض المهمة وإعادتها للطالب.', 'success');
    } catch (error) {
        console.error("خطأ في رفض المهمة:", error);
        displayMessage('pending-tasks-message', 'حدث خطأ أثناء رفض المهمة.', 'error');
    }
}

/** تحميل وعرض قائمة الترتيب العام */
function loadLeaderboard() {
    db.collection('users')
        .where('role', '==', 'student')
        .orderBy('points', 'desc') // الترتيب تنازلياً حسب النقاط
        .onSnapshot(snapshot => {
            const leaderboard = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            renderLeaderboard(leaderboard);
        }, error => {
            console.error("خطأ في تحميل الترتيب العام:", error);
        });
}

/** عرض قائمة الترتيب العام */
function renderLeaderboard(leaderboard) {
    const list = document.getElementById('leaderboard-list');
    list.innerHTML = '';
    
    if (leaderboard.length === 0) {
        list.innerHTML = '<p>لا يوجد طلاب في قائمة الترتيب.</p>';
        return;
    }

    leaderboard.forEach((student, index) => {
        const item = document.createElement('li');
        item.className = 'leaderboard-item';
        item.style.backgroundColor = index === 0 ? '#fff3cd' : '#f9f9f9'; // تمييز المركز الأول
        item.innerHTML = `
            <div class="leaderboard-details">
                <h4>#${index + 1}. ${student.name}</h4>
                <p><strong>رمز الدخول:</strong> ${student.code}</p>
            </div>
            <div class="leaderboard-actions">
                 <h3>${student.points} نقطة</h3>
            </div>
        `;
        list.appendChild(item);
    });
}

/** معالجة تبديل عرض المنهج (حفظ/مراجعة) */
function handleCurriculumSelectChange() {
    const type = document.getElementById('curriculum-type-select').value;
    renderCurriculumList(type);
}

/** عرض قائمة المنهج بناءً على النوع */
function renderCurriculumList(type) {
    const list = document.getElementById('curriculum-list');
    list.innerHTML = '';
    const curriculum = type === 'hifz' ? HifzCurriculum : MurajaaCurriculum;

    curriculum.forEach((item, index) => {
        const itemElement = document.createElement('li');
        itemElement.className = 'task-item';
        itemElement.innerHTML = `
            <div class="task-description">
                <h4>فهرس: ${index} | السورة: ${item.surah}</h4>
                <p><strong>الوصف:</strong> ${item.label}</p>
                <p><strong>النقاط:</strong> ${item.points}</p>
                ${item.type === 'murajaa' && item.hifz_start_index !== undefined ? 
                    `<p style="color: #007bff; font-weight: bold;">(يرتبط بحفظ فهارس: ${item.hifz_start_index} إلى ${item.hifz_end_index})</p>` : ''}
            </div>
        `;
        list.appendChild(itemElement);
    });
}


// =================================================================
// 9. شاشة الطالب (Student Screen)
// =================================================================

function showStudentScreen() {
    showScreen('student-screen');
    document.getElementById('student-name-display').textContent = `مرحباً، ${currentUser.name}`;
    loadStudentDataAndTasks();
}

/** تحميل بيانات الطالب ومهامه من Firebase */
function loadStudentDataAndTasks() {
    // الاستماع لتغييرات بيانات الطالب (النقاط والتقدم)
    db.collection('users').doc(currentUser.code)
        .onSnapshot(doc => {
            if (doc.exists) {
                currentUser = doc.data(); // تحديث بيانات الطالب الحالية
                updateStudentDashboard(currentUser);
            }
        });

    // الاستماع لتغييرات المهام الخاصة بالطالب
    db.collection('tasks').where('studentCode', '==', currentUser.code)
        .where('status', 'in', ['assigned', 'pending', 'completed'])
        .orderBy('assignedAt', 'desc') // عرض الأحدث أولاً
        .onSnapshot(snapshot => {
            const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            renderStudentTasks(tasks);
        });
}

/** تحديث لوحة تحكم الطالب (النقاط والتقدم) */
function updateStudentDashboard(studentData) {
    document.getElementById('student-total-points-display').textContent = studentData.points || 0;
    
    // 1. تحديث تقدم الحفظ
    const currentHifzItem = HifzCurriculum[studentData.hifzProgress];
    const hifzStartGoalItem = HifzCurriculum[studentData.hifzGoalStart];
    const hifzEndGoalItem = HifzCurriculum[studentData.hifzGoalEnd - 1] || { label: 'نهاية المنهج' }; // -1 لأن النهاية تكون index + 1
    
    const hifzProgressDisplay = currentHifzItem ? currentHifzItem.label : 'لم يبدأ الحفظ';
    
    document.getElementById('student-hifz-progress-display').textContent = hifzProgressDisplay;
    
    // حساب النسبة المئوية
    let progressPercent = 0;
    const totalGoalSteps = studentData.hifzGoalEnd - studentData.hifzGoalStart;
    if (totalGoalSteps > 0) {
        const completedSteps = studentData.hifzProgress - studentData.hifzGoalStart;
        progressPercent = Math.min(100, Math.max(0, (completedSteps / totalGoalSteps) * 100));
    }

    const hifzProgressBar = document.getElementById('hifz-progress-bar');
    hifzProgressBar.style.width = `${progressPercent.toFixed(1)}%`;
    hifzProgressBar.textContent = `${progressPercent.toFixed(1)}%`;
    
    document.getElementById('student-hifz-goal-display').textContent = `الهدف: من ${hifzStartGoalItem ? hifzStartGoalItem.label : 'البداية'} إلى ${hifzEndGoalItem.label}`;


    // 2. تحديث تقدم المراجعة
    const currentMurajaaItem = MurajaaCurriculum[studentData.murajaaProgress];
    const murajaaProgressDisplay = currentMurajaaItem ? currentMurajaaItem.label : 'لم يبدأ المراجعة';
    document.getElementById('student-murajaa-progress-display').textContent = murajaaProgressDisplay;
    // لا يوجد شريط مئوي للمراجعة حالياً، لذا نكتفي بالعرض النصي

    // يمكن إضافة شريط تقدم للمراجعة أيضاً إذا تم تحديد هدف للمراجعة في بيانات الطالب
}

/** عرض مهام الطالب مع تطبيق قواعد التحديد */
function renderStudentTasks(allTasks) {
    const list = document.getElementById('student-tasks-list');
    list.innerHTML = '';
    
    if (allTasks.length === 0) {
        list.innerHTML = '<p>لا توجد مهام معينة حاليًا. انتظر من المعلم تعيين مهمة جديدة.</p>';
        return;
    }

    const studentHifzIndex = currentUser.hifzProgress;
    const studentMurajaaIndex = currentUser.murajaaProgress;

    const assignedHifzTasks = allTasks.filter(t => t.type === 'hifz' && t.status === 'assigned');
    const assignedMurajaaTasks = allTasks.filter(t => t.type === 'murajaa' && t.status === 'assigned');
    const generalTasks = allTasks.filter(t => t.type === 'general' && t.status === 'assigned');
    const pendingTasks = allTasks.filter(t => t.status === 'pending');
    const completedTasks = allTasks.filter(t => t.status === 'completed');


    // 1. تحديد مهام الحفظ المسموح بعرضها (فقط الأقرب للتقدم الحالي)
    const displayHifzTasks = assignedHifzTasks
        .filter(task => task.curriculumIndex >= studentHifzIndex) // فقط المهام التالية لتقدمه الحالي
        .sort((a, b) => a.curriculumIndex - b.curriculumIndex) // ترتيب حسب الفهرس
        .slice(0, 2); // عرض أول 2 فقط

    // 2. تحديد مهام المراجعة المسموح بعرضها (فقط الأقرب للتقدم الحالي)
    const displayMurajaaTasks = assignedMurajaaTasks
        .filter(task => task.curriculumIndex >= studentMurajaaIndex) // فقط المهام التالية لتقدمه الحالي
        .sort((a, b) => a.curriculumIndex - b.curriculumIndex) // ترتيب حسب الفهرس
        .slice(0, 2); // عرض أول 2 فقط

    // دمج المهام التي سيتم عرضها بترتيبها حسب تاريخ التعيين (الأحدث أولاً)
    const tasksToDisplay = [
        ...pendingTasks.sort((a, b) => b.assignedAt.seconds - a.assignedAt.seconds), // المهام المعلقة في الأعلى
        ...displayHifzTasks,
        ...displayMurajaaTasks,
        ...generalTasks,
    ].sort((a, b) => {
        // ترتيب خاص: المعلقة -> الحفظ والمراجعة (الأحدث) -> العامة (الأحدث)
        if (a.status === 'pending') return -1;
        if (b.status === 'pending') return 1;
        
        // الأحدث أولا داخل نفس الحالة
        return b.assignedAt.seconds - a.assignedAt.seconds;
    });

    tasksToDisplay.forEach(task => {
        const item = document.createElement('div');
        item.className = `task-item task-${task.status}`;
        let statusText = '';
        let buttonHtml = '';

        if (task.status === 'assigned') {
            statusText = 'مُعيّنة';
            buttonHtml = `<button onclick="markTaskAsDone('${task.id}')">إنجاز وإرسال للمراجعة</button>`;
        } else if (task.status === 'pending') {
            statusText = 'قيد المراجعة...';
            buttonHtml = `<button disabled>في انتظار موافقة المعلم</button>`;
        } else if (task.status === 'completed') {
            statusText = 'مُكتملة';
            item.classList.add('completed');
            buttonHtml = `<button disabled style="background-color: #ccc;">تمت الموافقة</button>`;
        }

        item.innerHTML = `
            <div class="task-description">
                <h4>${task.description}</h4>
                <p><strong>النقاط:</strong> ${task.points} | <strong>الحالة:</strong> ${statusText}</p>
            </div>
            <div class="task-actions">
                ${buttonHtml}
            </div>
        `;
        list.appendChild(item);
    });
    
    // إظهار المهام المكتملة أيضاً في نهاية القائمة للمتابعة
    const completedList = document.createElement('div');
    completedList.innerHTML = '<h3>المهام المكتملة:</h3>';
    completedTasks.forEach(task => {
        const item = document.createElement('div');
        item.className = `task-item completed`;
        item.innerHTML = `
            <div class="task-description">
                <p>✓ ${task.description} <strong>(+${task.points} نقطة)</strong></p>
            </div>
        `;
        completedList.appendChild(item);
    });
     list.appendChild(completedList);
}

/** معالجة إرسال المهمة للمراجعة (للطالب) */
async function markTaskAsDone(taskId) {
    if (!confirm('هل أنت متأكد من إنجاز المهمة وإرسالها للمراجعة؟')) return;
    try {
        await db.collection('tasks').doc(taskId).update({ 
            status: 'pending',
            submittedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        displayMessage('student-dashboard-message', 'تم إرسال المهمة بنجاح. في انتظار موافقة المعلم.', 'success');
    } catch (error) {
        console.error("خطأ في تحديث حالة المهمة:", error);
        displayMessage('student-dashboard-message', 'حدث خطأ أثناء إرسال المهمة.', 'error');
    }
}


// =================================================================
// 10. إعدادات الحدث (Event Listeners)
// =================================================================

document.addEventListener('DOMContentLoaded', () => {
    initializeData();

    // 1. شاشة الدخول
    document.getElementById('login-button').addEventListener('click', handleLogin);
    document.getElementById('login-code').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });

    // 2. شاشة المعلم
    document.getElementById('logout-button-teacher').addEventListener('click', handleLogout);
    document.getElementById('add-student-button').addEventListener('click', addStudent);
    document.getElementById('assign-task-button').addEventListener('click', assignTask);
    
    document.getElementById('curriculum-type-select').addEventListener('change', handleCurriculumSelectChange);

    // معالجة التبديل بين التبويبات في شاشة المعلم
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', (e) => {
            document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.add('hidden'));
            
            e.target.classList.add('active');
            const tabId = e.target.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.remove('hidden');

            // تحديث محتوى التبويبة عند الضغط
            if (tabId === 'manage-students') loadStudents();
            if (tabId === 'pending-tasks') loadPendingTasks();
            if (tabId === 'leaderboard') loadLeaderboard();
            if (tabId === 'manage-curriculum') handleCurriculumSelectChange();
        });
    });

    // 3. شاشة الطالب
    document.getElementById('logout-button-student').addEventListener('click', handleLogout);
});

