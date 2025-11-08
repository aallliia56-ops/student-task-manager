/**
 * =========================================================================
 * ملف: curriculum.js (النسخة المُصاغة)
 * -------------------------------------------------------------------------
 * يحتوي على تفاصيل المنهج كاملة، مُضافة إليها:
 * 1. حقل 'id' فريد لكل مقطع حفظ (للتتبع في قاعدة بيانات الطالب).
 * 2. حقل 'points' ثابت (5 للحفظ، 3 للمراجعة) لكل مهمة.
 * 3. دمج هياكل البيانات لسهولة الاستيراد والاستخدام.
 * =========================================================================
 */

// =========================================================================
// 1. HIFZ_CURRICULUM: القائمة الشاملة لجميع مقاطع السور للحفظ (HIFZ_CURRICULUM)
// =========================================================================
// تمت إضافة حقل 'id' فريد لسهولة تتبع تقدم الطالب، وحقل 'points' (نقاط الحفظ = 5).
// الترتيب: عكسي (من الناس 114 إلى الفاتحة 1).

const HIFZ_CURRICULUM = [
    // id: 0
    { id: 0, surah_number: 114, surah_name_ar: "الناس", start_ayah: 1, end_ayah: 6, page: 604, points: 5 },
    // id: 1
    { id: 1, surah_number: 113, surah_name_ar: "الفلق", start_ayah: 1, end_ayah: 5, page: 604, points: 5 },
    // id: 2
    { id: 2, surah_number: 112, surah_name_ar: "الإخلاص", start_ayah: 1, end_ayah: 4, page: 604, points: 5 },
    // id: 3
    { id: 3, surah_number: 111, surah_name_ar: "المسد", start_ayah: 1, end_ayah: 5, page: 604, points: 5 },
    // id: 4
    { id: 4, surah_number: 110, surah_name_ar: "النصر", start_ayah: 1, end_ayah: 3, page: 603, points: 5 },
    // id: 5
    { id: 5, surah_number: 109, surah_name_ar: "الكافرون", start_ayah: 1, end_ayah: 6, page: 603, points: 5 },
    // id: 6
    { id: 6, surah_number: 108, surah_name_ar: "الكوثر", start_ayah: 1, end_ayah: 3, page: 603, points: 5 },
    // id: 7
    { id: 7, surah_number: 107, surah_name_ar: "الماعون", start_ayah: 1, end_ayah: 7, page: 602, points: 5 },
    // id: 8
    { id: 8, surah_number: 106, surah_name_ar: "قريش", start_ayah: 1, end_ayah: 4, page: 602, points: 5 },
    // id: 9
    { id: 9, surah_number: 105, surah_name_ar: "الفيل", start_ayah: 1, end_ayah: 5, page: 601, points: 5 },
    // id: 10
    { id: 10, surah_number: 104, surah_name_ar: "الهمزة", start_ayah: 1, end_ayah: 9, page: 601, points: 5 },
    // id: 11
    { id: 11, surah_number: 103, surah_name_ar: "العصر", start_ayah: 1, end_ayah: 3, page: 601, points: 5 },
    // id: 12
    { id: 12, surah_number: 102, surah_name_ar: "التكاثر", start_ayah: 1, end_ayah: 8, page: 600, points: 5 },
    // id: 13
    { id: 13, surah_number: 101, surah_name_ar: "القارعة", start_ayah: 1, end_ayah: 11, page: 600, points: 5 },
    // id: 14
    { id: 14, surah_number: 100, surah_name_ar: "العاديات", start_ayah: 1, end_ayah: 11, page: 599, points: 5 },
    // id: 15
    { id: 15, surah_number: 99, surah_name_ar: "الزلزلة", start_ayah: 1, end_ayah: 8, page: 599, points: 5 },
    // id: 16
    { id: 16, surah_number: 98, surah_name_ar: "البينة", start_ayah: 1, end_ayah: 3, page: 598, points: 5 },
    // id: 17
    { id: 17, surah_number: 98, surah_name_ar: "البينة", start_ayah: 4, end_ayah: 5, page: 598, points: 5 },
    // id: 18
    { id: 18, surah_number: 98, surah_name_ar: "البينة", start_ayah: 6, end_ayah: 8, page: 598, points: 5 },
    // id: 19
    { id: 19, surah_number: 97, surah_name_ar: "القدر", start_ayah: 1, end_ayah: 5, page: 598, points: 5 },
    // id: 20
    { id: 20, surah_number: 96, surah_name_ar: "العلق", start_ayah: 1, end_ayah: 8, page: 597, points: 5 },
    // id: 21
    { id: 21, surah_number: 96, surah_name_ar: "العلق", start_ayah: 9, end_ayah: 19, page: 597, points: 5 },
    // id: 22
    { id: 22, surah_number: 95, surah_name_ar: "التين", start_ayah: 1, end_ayah: 8, page: 597, points: 5 },
    // id: 23
    { id: 23, surah_number: 94, surah_name_ar: "الشرح", start_ayah: 1, end_ayah: 8, page: 596, points: 5 },
    // id: 24
    { id: 24, surah_number: 93, surah_name_ar: "الضحى", start_ayah: 1, end_ayah: 11, page: 596, points: 5 },
    // id: 25
    { id: 25, surah_number: 92, surah_name_ar: "الليل", start_ayah: 1, end_ayah: 10, page: 595, points: 5 },
    // id: 26
    { id: 26, surah_number: 92, surah_name_ar: "الليل", start_ayah: 11, end_ayah: 21, page: 595, points: 5 },
    // id: 27
    { id: 27, surah_number: 91, surah_name_ar: "الشمس", start_ayah: 1, end_ayah: 15, page: 595, points: 5 },
    // id: 28
    { id: 28, surah_number: 90, surah_name_ar: "البلد", start_ayah: 1, end_ayah: 10, page: 594, points: 5 },
    // id: 29
    { id: 29, surah_number: 90, surah_name_ar: "البلد", start_ayah: 11, end_ayah: 20, page: 594, points: 5 },
    // id: 30
    { id: 30, surah_number: 89, surah_name_ar: "الفجر", start_ayah: 1, end_ayah: 10, page: 593, points: 5 },
    // id: 31
    { id: 31, surah_number: 89, surah_name_ar: "الفجر", start_ayah: 11, end_ayah: 16, page: 593, points: 5 },
    // id: 32
    { id: 32, surah_number: 89, surah_name_ar: "الفجر", start_ayah: 17, end_ayah: 22, page: 593, points: 5 },
    // id: 33
    { id: 33, surah_number: 89, surah_name_ar: "الفجر", start_ayah: 23, end_ayah: 30, page: 593, points: 5 },
    // id: 34
    { id: 34, surah_number: 88, surah_name_ar: "الغاشية", start_ayah: 1, end_ayah: 16, page: 592, points: 5 },
    // id: 35
    { id: 35, surah_number: 88, surah_name_ar: "الغاشية", start_ayah: 17, end_ayah: 26, page: 592, points: 5 },
    // id: 36
    { id: 36, surah_number: 87, surah_name_ar: "الأعلى", start_ayah: 1, end_ayah: 8, page: 591, points: 5 },
    // id: 37
    { id: 37, surah_number: 87, surah_name_ar: "الأعلى", start_ayah: 9, end_ayah: 19, page: 591, points: 5 },
    // id: 38
    { id: 38, surah_number: 86, surah_name_ar: "الطارق", start_ayah: 1, end_ayah: 9, page: 590, points: 5 },
    // id: 39
    { id: 39, surah_number: 86, surah_name_ar: "الطارق", start_ayah: 10, end_ayah: 17, page: 590, points: 5 },
    // id: 40
    { id: 40, surah_number: 85, surah_name_ar: "البروج", start_ayah: 1, end_ayah: 8, page: 589, points: 5 },
    // id: 41
    { id: 41, surah_number: 85, surah_name_ar: "البروج", start_ayah: 9, end_ayah: 11, page: 589, points: 5 },
    // id: 42
    { id: 42, surah_number: 85, surah_name_ar: "البروج", start_ayah: 12, end_ayah: 22, page: 589, points: 5 },
    // id: 43
    { id: 43, surah_number: 84, surah_name_ar: "الانشقاق", start_ayah: 1, end_ayah: 9, page: 588, points: 5 },
    // id: 44
    { id: 44, surah_number: 84, surah_name_ar: "الانشقاق", start_ayah: 10, end_ayah: 18, page: 588, points: 5 },
    // id: 45
    { id: 45, surah_number: 84, surah_name_ar: "الانشقاق", start_ayah: 19, end_ayah: 25, page: 588, points: 5 },
    // id: 46
    { id: 46, surah_number: 83, surah_name_ar: "المطففين", start_ayah: 1, end_ayah: 9, page: 587, points: 5 },
    // id: 47
    { id: 47, surah_number: 83, surah_name_ar: "المطففين", start_ayah: 10, end_ayah: 17, page: 587, points: 5 },
    // id: 48
    { id: 48, surah_number: 83, surah_name_ar: "المطففين", start_ayah: 18, end_ayah: 28, page: 587, points: 5 },
    // id: 49
    { id: 49, surah_number: 83, surah_name_ar: "المطففين", start_ayah: 29, end_ayah: 36, page: 587, points: 5 },
    // id: 50
    { id: 50, surah_number: 82, surah_name_ar: "الانفطار", start_ayah: 1, end_ayah: 8, page: 587, points: 5 },
    // id: 51
    { id: 51, surah_number: 82, surah_name_ar: "الانفطار", start_ayah: 9, end_ayah: 19, page: 587, points: 5 },
    // id: 52
    { id: 52, surah_number: 81, surah_name_ar: "التكوير", start_ayah: 1, end_ayah: 9, page: 586, points: 5 },
    // id: 53
    { id: 53, surah_number: 81, surah_name_ar: "التكوير", start_ayah: 10, end_ayah: 18, page: 586, points: 5 },
    // id: 54
    { id: 54, surah_number: 81, surah_name_ar: "التكوير", start_ayah: 19, end_ayah: 29, page: 586, points: 5 },
    // id: 55
    { id: 55, surah_number: 80, surah_name_ar: "عبس", start_ayah: 1, end_ayah: 16, page: 585, points: 5 },
    // id: 56
    { id: 56, surah_number: 80, surah_name_ar: "عبس", start_ayah: 17, end_ayah: 23, page: 585, points: 5 },
    // id: 57
    { id: 57, surah_number: 80, surah_name_ar: "عبس", start_ayah: 24, end_ayah: 32, page: 585, points: 5 },
    // id: 58
    { id: 58, surah_number: 80, surah_name_ar: "عبس", start_ayah: 33, end_ayah: 42, page: 585, points: 5 },
    // id: 59
    { id: 59, surah_number: 79, surah_name_ar: "النازعات", start_ayah: 1, end_ayah: 14, page: 583, points: 5 },
    // id: 60
    { id: 60, surah_number: 79, surah_name_ar: "النازعات", start_ayah: 15, end_ayah: 25, page: 583, points: 5 },
    // id: 61
    { id: 61, surah_number: 79, surah_name_ar: "النازعات", start_ayah: 26, end_ayah: 33, page: 583, points: 5 },
    // id: 62
    { id: 62, surah_number: 79, surah_name_ar: "النازعات", start_ayah: 34, end_ayah: 46, page: 583, points: 5 },
    // id: 63
    { id: 63, surah_number: 78, surah_name_ar: "النبأ", start_ayah: 1, end_ayah: 11, page: 582, points: 5 },
    // id: 64
    { id: 64, surah_number: 78, surah_name_ar: "النبأ", start_ayah: 12, end_ayah: 20, page: 582, points: 5 },
    // id: 65
    { id: 65, surah_number: 78, surah_name_ar: "النبأ", start_ayah: 21, end_ayah: 30, page: 582, points: 5 },
    // id: 66
    { id: 66, surah_number: 78, surah_name_ar: "النبأ", start_ayah: 31, end_ayah: 37, page: 582, points: 5 },
    // id: 67
    { id: 67, surah_number: 78, surah_name_ar: "النبأ", start_ayah: 38, end_ayah: 40, page: 582, points: 5 },
    // id: 68
    { id: 68, surah_number: 77, surah_name_ar: "المرسلات", start_ayah: 1, end_ayah: 15, page: 580, points: 5 },
    // id: 69
    { id: 69, surah_number: 77, surah_name_ar: "المرسلات", start_ayah: 16, end_ayah: 24, page: 580, points: 5 },
    // id: 70
    { id: 70, surah_number: 77, surah_name_ar: "المرسلات", start_ayah: 25, end_ayah: 28, page: 580, points: 5 },
    // id: 71
    { id: 71, surah_number: 77, surah_name_ar: "المرسلات", start_ayah: 29, end_ayah: 34, page: 580, points: 5 },
    // id: 72
    { id: 72, surah_number: 77, surah_name_ar: "المرسلات", start_ayah: 35, end_ayah: 40, page: 580, points: 5 },
    // id: 73
    { id: 73, surah_number: 77, surah_name_ar: "المرسلات", start_ayah: 41, end_ayah: 50, page: 580, points: 5 },
    // id: 74
    { id: 74, surah_number: 76, surah_name_ar: "الإنسان", start_ayah: 1, end_ayah: 5, page: 578, points: 5 },
    // id: 75
    { id: 75, surah_number: 76, surah_name_ar: "الإنسان", start_ayah: 6, end_ayah: 12, page: 578, points: 5 },
    // id: 76
    { id: 76, surah_number: 76, surah_name_ar: "الإنسان", start_ayah: 13, end_ayah: 18, page: 578, points: 5 },
    // id: 77
    { id: 77, surah_number: 76, surah_name_ar: "الإنسان", start_ayah: 19, end_ayah: 23, page: 578, points: 5 },
    // id: 78
    { id: 78, surah_number: 76, surah_name_ar: "الإنسان", start_ayah: 24, end_ayah: 28, page: 578, points: 5 },
    // id: 79
    { id: 79, surah_number: 76, surah_name_ar: "الإنسان", start_ayah: 29, end_ayah: 31, page: 578, points: 5 },
    // id: 80
    { id: 80, surah_number: 75, surah_name_ar: "القيامة", start_ayah: 1, end_ayah: 10, page: 577, points: 5 },
    // id: 81
    { id: 81, surah_number: 75, surah_name_ar: "القيامة", start_ayah: 11, end_ayah: 19, page: 577, points: 5 },
    // id: 82
    { id: 82, surah_number: 75, surah_name_ar: "القيامة", start_ayah: 20, end_ayah: 33, page: 577, points: 5 },
    // id: 83
    { id: 83, surah_number: 75, surah_name_ar: "القيامة", start_ayah: 34, end_ayah: 40, page: 577, points: 5 },
    // id: 84
    { id: 84, surah_number: 74, surah_name_ar: "المدثر", start_ayah: 1, end_ayah: 10, page: 575, points: 5 },
    // id: 85
    { id: 85, surah_number: 74, surah_name_ar: "المدثر", start_ayah: 11, end_ayah: 18, page: 575, points: 5 },
    // id: 86
    { id: 86, surah_number: 74, surah_name_ar: "المدثر", start_ayah: 19, end_ayah: 30, page: 575, points: 5 },
    // id: 87
    { id: 87, surah_number: 74, surah_name_ar: "المدثر", start_ayah: 31, end_ayah: 41, page: 575, points: 5 },
    // id: 88
    { id: 88, surah_number: 74, surah_name_ar: "المدثر", start_ayah: 42, end_ayah: 47, page: 575, points: 5 },
    // id: 89
    { id: 89, surah_number: 74, surah_name_ar: "المدثر", start_ayah: 48, end_ayah: 56, page: 575, points: 5 },
    // id: 90
    { id: 90, surah_number: 73, surah_name_ar: "المزمل", start_ayah: 1, end_ayah: 8, page: 574, points: 5 },
    // id: 91
    { id: 91, surah_number: 73, surah_name_ar: "المزمل", start_ayah: 9, end_ayah: 14, page: 574, points: 5 },
    // id: 92
    { id: 92, surah_number: 73, surah_name_ar: "المزمل", start_ayah: 15, end_ayah: 19, page: 574, points: 5 },
    // id: 93
    { id: 93, surah_number: 73, surah_name_ar: "المزمل", start_ayah: 20, end_ayah: 20, page: 574, points: 5 },
    // id: 94
    { id: 94, surah_number: 72, surah_name_ar: "الجن", start_ayah: 1, end_ayah: 4, page: 572, points: 5 },
    // id: 95
    { id: 95, surah_number: 72, surah_name_ar: "الجن", start_ayah: 5, end_ayah: 8, page: 572, points: 5 },
    // id: 96
    { id: 96, surah_number: 72, surah_name_ar: "الجن", start_ayah: 9, end_ayah: 11, page: 572, points: 5 },
    // id: 97
    { id: 97, surah_number: 72, surah_name_ar: "الجن", start_ayah: 12, end_ayah: 14, page: 572, points: 5 },
    // id: 98
    { id: 98, surah_number: 72, surah_name_ar: "الجن", start_ayah: 15, end_ayah: 19, page: 572, points: 5 },
    // id: 99
    { id: 99, surah_number: 72, surah_name_ar: "الجن", start_ayah: 20, end_ayah: 23, page: 572, points: 5 },
    // id: 100
    { id: 100, surah_number: 72, surah_name_ar: "الجن", start_ayah: 24, end_ayah: 28, page: 572, points: 5 },
    // id: 101
    { id: 101, surah_number: 71, surah_name_ar: "نوح", start_ayah: 1, end_ayah: 4, page: 570, points: 5 },
    // id: 102
    { id: 102, surah_number: 71, surah_name_ar: "نوح", start_ayah: 5, end_ayah: 10, page: 570, points: 5 },
    // id: 103
    { id: 103, surah_number: 71, surah_name_ar: "نوح", start_ayah: 11, end_ayah: 20, page: 570, points: 5 },
    // id: 104
    { id: 104, surah_number: 71, surah_name_ar: "نوح", start_ayah: 21, end_ayah: 25, page: 570, points: 5 },
    // id: 105
    { id: 105, surah_number: 71, surah_name_ar: "نوح", start_ayah: 26, end_ayah: 28, page: 570, points: 5 },
    // id: 106
    { id: 106, surah_number: 70, surah_name_ar: "المعارج", start_ayah: 1, end_ayah: 10, page: 568, points: 5 },
    // id: 107
    { id: 107, surah_number: 70, surah_name_ar: "المعارج", start_ayah: 11, end_ayah: 18, page: 568, points: 5 },
    // id: 108
    { id: 108, surah_number: 70, surah_name_ar: "المعارج", start_ayah: 19, end_ayah: 28, page: 568, points: 5 },
    // id: 109
    { id: 109, surah_number: 70, surah_name_ar: "المعارج", start_ayah: 29, end_ayah: 35, page: 568, points: 5 },
    // id: 110
    { id: 110, surah_number: 70, surah_name_ar: "المعارج", start_ayah: 36, end_ayah: 40, page: 568, points: 5 },
    // id: 111
    { id: 111, surah_number: 70, surah_name_ar: "المعارج", start_ayah: 41, end_ayah: 44, page: 568, points: 5 },
    // id: 112
    { id: 112, surah_number: 69, surah_name_ar: "الحاقة", start_ayah: 1, end_ayah: 8, page: 566, points: 5 },
    // id: 113
    { id: 113, surah_number: 69, surah_name_ar: "الحاقة", start_ayah: 9, end_ayah: 18, page: 566, points: 5 },
    // id: 114
    { id: 114, surah_number: 69, surah_name_ar: "الحاقة", start_ayah: 19, end_ayah: 24, page: 566, points: 5 },
    // id: 115
    { id: 115, surah_number: 69, surah_name_ar: "الحاقة", start_ayah: 25, end_ayah: 35, page: 566, points: 5 },
    // id: 116
    { id: 116, surah_number: 69, surah_name_ar: "الحاقة", start_ayah: 36, end_ayah: 43, page: 566, points: 5 },
    // id: 117
    { id: 117, surah_number: 69, surah_name_ar: "الحاقة", start_ayah: 44, end_ayah: 52, page: 566, points: 5 },
    // id: 118
    { id: 118, surah_number: 68, surah_name_ar: "القلم", start_ayah: 1, end_ayah: 9, page: 564, points: 5 },
    // id: 119
    { id: 119, surah_number: 68, surah_name_ar: "القلم", start_ayah: 10, end_ayah: 16, page: 564, points: 5 },
    // id: 120
    { id: 120, surah_number: 68, surah_name_ar: "القلم", start_ayah: 17, end_ayah: 27, page: 564, points: 5 },
    // id: 121
    { id: 121, surah_number: 68, surah_name_ar: "القلم", start_ayah: 28, end_ayah: 33, page: 564, points: 5 },
    // id: 122
    { id: 122, surah_number: 68, surah_name_ar: "القلم", start_ayah: 34, end_ayah: 42, page: 564, points: 5 },
    // id: 123
    { id: 123, surah_number: 68, surah_name_ar: "القلم", start_ayah: 43, end_ayah: 47, page: 564, points: 5 },
    // id: 124
    { id: 124, surah_number: 68, surah_name_ar: "القلم", start_ayah: 48, end_ayah: 52, page: 564, points: 5 },
    // id: 125
    { id: 125, surah_number: 67, surah_name_ar: "الملك", start_ayah: 1, end_ayah: 5, page: 562, points: 5 },
    // id: 126
    { id: 126, surah_number: 67, surah_name_ar: "الملك", start_ayah: 6, end_ayah: 12, page: 562, points: 5 },
    // id: 127
    { id: 127, surah_number: 67, surah_name_ar: "الملك", start_ayah: 13, end_ayah: 19, page: 562, points: 5 },
    // id: 128
    { id: 128, surah_number: 67, surah_name_ar: "الملك", start_ayah: 20, end_ayah: 26, page: 562, points: 5 },
    // id: 129
    { id: 129, surah_number: 67, surah_name_ar: "الملك", start_ayah: 27, end_ayah: 30, page: 562, points: 5 },
    // id: 130
    { id: 130, surah_number: 66, surah_name_ar: "التحريم", start_ayah: 1, end_ayah: 3, page: 560, points: 5 },
    // id: 131
    { id: 131, surah_number: 66, surah_name_ar: "التحريم", start_ayah: 4, end_ayah: 5, page: 560, points: 5 },
    // id: 132
    { id: 132, surah_number: 66, surah_name_ar: "التحريم", start_ayah: 6, end_ayah: 7, page: 560, points: 5 },
    // id: 133
    { id: 133, surah_number: 66, surah_name_ar: "التحريم", start_ayah: 8, end_ayah: 10, page: 560, points: 5 },
    // id: 134
    { id: 134, surah_number: 66, surah_name_ar: "التحريم", start_ayah: 11, end_ayah: 12, page: 560, points: 5 },
    // id: 135
    { id: 135, surah_number: 65, surah_name_ar: "الطلاق", start_ayah: 1, end_ayah: 2, page: 558, points: 5 },
    // id: 136
    { id: 136, surah_number: 65, surah_name_ar: "الطلاق", start_ayah: 3, end_ayah: 5, page: 558, points: 5 },
    // id: 137
    { id: 137, surah_number: 65, surah_name_ar: "الطلاق", start_ayah: 6, end_ayah: 9, page: 558, points: 5 },
    // id: 138
    { id: 138, surah_number: 65, surah_name_ar: "الطلاق", start_ayah: 10, end_ayah: 11, page: 558, points: 5 },
    // id: 139
    { id: 139, surah_number: 65, surah_name_ar: "الطلاق", start_ayah: 12, end_ayah: 12, page: 558, points: 5 },
    // id: 140
    { id: 140, surah_number: 64, surah_name_ar: "التغابن", start_ayah: 1, end_ayah: 4, page: 556, points: 5 },
    // id: 141
    { id: 141, surah_number: 64, surah_name_ar: "التغابن", start_ayah: 5, end_ayah: 7, page: 556, points: 5 },
    // id: 142
    { id: 142, surah_number: 64, surah_name_ar: "التغابن", start_ayah: 8, end_ayah: 9, page: 556, points: 5 },
    // id: 143
    { id: 143, surah_number: 64, surah_name_ar: "التغابن", start_ayah: 10, end_ayah: 13, page: 556, points: 5 },
    // id: 144
    { id: 144, surah_number: 64, surah_name_ar: "التغابن", start_ayah: 14, end_ayah: 15, page: 556, points: 5 },
    // id: 145
    { id: 145, surah_number: 64, surah_name_ar: "التغابن", start_ayah: 16, end_ayah: 18, page: 556, points: 5 },
    // id: 146
    { id: 146, surah_number: 63, surah_name_ar: "المنافقون", start_ayah: 1, end_ayah: 3, page: 555, points: 5 },
    // id: 147
    { id: 147, surah_number: 63, surah_name_ar: "المنافقون", start_ayah: 4, end_ayah: 5, page: 555, points: 5 },
    // id: 148
    { id: 148, surah_number: 63, surah_name_ar: "المنافقون", start_ayah: 6, end_ayah: 7, page: 555, points: 5 },
    // id: 149
    { id: 149, surah_number: 63, surah_name_ar: "المنافقون", start_ayah: 8, end_ayah: 9, page: 555, points: 5 },
    // id: 150
    { id: 150, surah_number: 63, surah_name_ar: "المنافقون", start_ayah: 10, end_ayah: 11, page: 555, points: 5 },
    // id: 151
    { id: 151, surah_number: 62, surah_name_ar: "الجمعة", start_ayah: 1, end_ayah: 3, page: 553, points: 5 },
    // id: 152
    { id: 152, surah_number: 62, surah_name_ar: "الجمعة", start_ayah: 4, end_ayah: 5, page: 553, points: 5 },
    // id: 153
    { id: 153, surah_number: 62, surah_name_ar: "الجمعة", start_ayah: 6, end_ayah: 8, page: 553, points: 5 },
    // id: 154
    { id: 154, surah_number: 62, surah_name_ar: "الجمعة", start_ayah: 9, end_ayah: 11, page: 553, points: 5 },
    // id: 155
    { id: 155, surah_number: 61, surah_name_ar: "الصف", start_ayah: 1, end_ayah: 4, page: 551, points: 5 },
    // id: 156
    { id: 156, surah_number: 61, surah_name_ar: "الصف", start_ayah: 5, end_ayah: 6, page: 551, points: 5 },
    // id: 157
    { id: 157, surah_number: 61, surah_name_ar: "الصف", start_ayah: 7, end_ayah: 9, page: 551, points: 5 },
    // id: 158
    { id: 158, surah_number: 61, surah_name_ar: "الصف", start_ayah: 10, end_ayah: 13, page: 551, points: 5 },
    // id: 159
    { id: 159, surah_number: 61, surah_name_ar: "الصف", start_ayah: 14, end_ayah: 14, page: 551, points: 5 },
    // id: 160
    { id: 160, surah_number: 60, surah_name_ar: "الممتحنة", start_ayah: 1, end_ayah: 2, page: 549, points: 5 },
    // id: 161
    { id: 161, surah_number: 60, surah_name_ar: "الممتحنة", start_ayah: 3, end_ayah: 4, page: 549, points: 5 },
    // id: 162
    { id: 162, surah_number: 60, surah_name_ar: "الممتحنة", start_ayah: 5, end_ayah: 7, page: 549, points: 5 },
    // id: 163
    { id: 163, surah_number: 60, surah_name_ar: "الممتحنة", start_ayah: 8, end_ayah: 9, page: 549, points: 5 },
    // id: 164
    { id: 164, surah_number: 60, surah_name_ar: "الممتحنة", start_ayah: 10, end_ayah: 11, page: 549, points: 5 },
    // id: 165
    { id: 165, surah_number: 60, surah_name_ar: "الممتحنة", start_ayah: 12, end_ayah: 13, page: 549, points: 5 },
    // id: 166
    { id: 166, surah_number: 59, surah_name_ar: "الحشر", start_ayah: 1, end_ayah: 3, page: 545, points: 5 },
    // id: 167
    { id: 167, surah_number: 59, surah_name_ar: "الحشر", start_ayah: 4, end_ayah: 6, page: 545, points: 5 },
    // id: 168
    { id: 168, surah_number: 59, surah_name_ar: "الحشر", start_ayah: 7, end_ayah: 8, page: 545, points: 5 },
    // id: 169
    { id: 169, surah_number: 59, surah_name_ar: "الحشر", start_ayah: 9, end_ayah: 10, page: 545, points: 5 },
    // id: 170
    { id: 170, surah_number: 59, surah_name_ar: "الحشر", start_ayah: 11, end_ayah: 12, page: 545, points: 5 },
    // id: 171
    { id: 171, surah_number: 59, surah_name_ar: "الحشر", start_ayah: 13, end_ayah: 14, page: 545, points: 5 },
    // id: 172
    { id: 172, surah_number: 59, surah_name_ar: "الحشر", start_ayah: 15, end_ayah: 19, page: 545, points: 5 },
    // id: 173
    { id: 173, surah_number: 59, surah_name_ar: "الحشر", start_ayah: 20, end_ayah: 24, page: 545, points: 5 },
    // id: 174
    { id: 174, surah_number: 58, surah_name_ar: "المجادلة", start_ayah: 1, end_ayah: 2, page: 542, points: 5 },
    // id: 175
    { id: 175, surah_number: 58, surah_name_ar: "المجادلة", start_ayah: 3, end_ayah: 4, page: 542, points: 5 },
    // id: 176
    { id: 176, surah_number: 58, surah_name_ar: "المجادلة", start_ayah: 5, end_ayah: 6, page: 542, points: 5 },
    // id: 177
    { id: 177, surah_number: 58, surah_name_ar: "المجادلة", start_ayah: 7, end_ayah: 8, page: 542, points: 5 },
    // id: 178
    { id: 178, surah_number: 58, surah_name_ar: "المجادلة", start_ayah: 9, end_ayah: 10, page: 542, points: 5 },
    // id: 179
    { id: 179, surah_number: 58, surah_name_ar: "المجادلة", start_ayah: 11, end_ayah: 12, page: 542, points: 5 },
    // id: 180
    { id: 180, surah_number: 58, surah_name_ar: "المجادلة", start_ayah: 13, end_ayah: 16, page: 542, points: 5 },
    // id: 181
    { id: 181, surah_number: 58, surah_name_ar: "المجادلة", start_ayah: 17, end_ayah: 19, page: 542, points: 5 },
    // id: 182
    { id: 182, surah_number: 58, surah_name_ar: "المجادلة", start_ayah: 20, end_ayah: 22, page: 542, points: 5 },
    // id: 183
    { id: 183, surah_number: 57, surah_name_ar: "الحديد", start_ayah: 1, end_ayah: 6, page: 537, points: 5 },
    // id: 184
    { id: 184, surah_number: 57, surah_name_ar: "الحديد", start_ayah: 7, end_ayah: 11, page: 537, points: 5 },
    // id: 185
    { id: 185, surah_number: 57, surah_name_ar: "الحديد", start_ayah: 12, end_ayah: 15, page: 537, points: 5 },
    // id: 186
    { id: 186, surah_number: 57, surah_name_ar: "الحديد", start_ayah: 16, end_ayah: 18, page: 537, points: 5 },
    // id: 187
    { id: 187, surah_number: 57, surah_name_ar: "الحديد", start_ayah: 19, end_ayah: 20, page: 537, points: 5 },
    // id: 188
    { id: 188, surah_number: 57, surah_name_ar: "الحديد", start_ayah: 21, end_ayah: 24, page: 537, points: 5 },
    // id: 189
    { id: 189, surah_number: 57, surah_name_ar: "الحديد", start_ayah: 25, end_ayah: 27, page: 537, points: 5 },
    // id: 190
    { id: 190, surah_number: 57, surah_name_ar: "الحديد", start_ayah: 28, end_ayah: 29, page: 537, points: 5 },
    // id: 191
    { id: 191, surah_number: 56, surah_name_ar: "الواقعة", start_ayah: 1, end_ayah: 16, page: 534, points: 5 },
    // id: 192
    { id: 192, surah_number: 56, surah_name_ar: "الواقعة", start_ayah: 17, end_ayah: 40, page: 534, points: 5 },
    // id: 193
    { id: 193, surah_number: 56, surah_name_ar: "الواقعة", start_ayah: 41, end_ayah: 57, page: 534, points: 5 },
    // id: 194
    { id: 194, surah_number: 56, surah_name_ar: "الواقعة", start_ayah: 58, end_ayah: 74, page: 534, points: 5 },
    // id: 195
    { id: 195, surah_number: 56, surah_name_ar: "الواقعة", start_ayah: 75, end_ayah: 96, page: 534, points: 5 },
    // id: 196
    { id: 196, surah_number: 55, surah_name_ar: "الرحمن", start_ayah: 1, end_ayah: 18, page: 531, points: 5 },
    // id: 197
    { id: 197, surah_number: 55, surah_name_ar: "الرحمن", start_ayah: 19, end_ayah: 32, page: 531, points: 5 },
    // id: 198
    { id: 198, surah_number: 55, surah_name_ar: "الرحمن", start_ayah: 33, end_ayah: 45, page: 531, points: 5 },
    // id: 199
    { id: 199, surah_number: 55, surah_name_ar: "الرحمن", start_ayah: 46, end_ayah: 61, page: 531, points: 5 },
    // id: 200
    { id: 200, surah_number: 55, surah_name_ar: "الرحمن", start_ayah: 62, end_ayah: 78, page: 531, points: 5 },
    // id: 201
    { id: 201, surah_number: 54, surah_name_ar: "القمر", start_ayah: 1, end_ayah: 8, page: 528, points: 5 },
    // id: 202
    { id: 202, surah_number: 54, surah_name_ar: "القمر", start_ayah: 9, end_ayah: 22, page: 528, points: 5 },
    // id: 203
    { id: 203, surah_number: 54, surah_name_ar: "القمر", start_ayah: 23, end_ayah: 32, page: 528, points: 5 },
    // id: 204
    { id: 204, surah_number: 54, surah_name_ar: "القمر", start_ayah: 33, end_ayah: 42, page: 528, points: 5 },
    // id: 205
    { id: 205, surah_number: 54, surah_name_ar: "القمر", start_ayah: 43, end_ayah: 55, page: 528, points: 5 },
    // id: 206
    { id: 206, surah_number: 53, surah_name_ar: "النجم", start_ayah: 1, end_ayah: 18, page: 526, points: 5 },
    // id: 207
    { id: 207, surah_number: 53, surah_name_ar: "النجم", start_ayah: 19, end_ayah: 26, page: 526, points: 5 },
    // id: 208
    { id: 208, surah_number: 53, surah_name_ar: "النجم", start_ayah: 27, end_ayah: 32, page: 526, points: 5 },
    // id: 209
    { id: 209, surah_number: 53, surah_name_ar: "النجم", start_ayah: 33, end_ayah: 44, page: 526, points: 5 },
    // id: 210
    { id: 210, surah_number: 53, surah_name_ar: "النجم", start_ayah: 45, end_ayah: 62, page: 526, points: 5 },
    // id: 211
    { id: 211, surah_number: 52, surah_name_ar: "الطور", start_ayah: 1, end_ayah: 14, page: 523, points: 5 },
    // id: 212
    { id: 212, surah_number: 52, surah_name_ar: "الطور", start_ayah: 15, end_ayah: 23, page: 523, points: 5 },
    // id: 213
    { id: 213, surah_number: 52, surah_name_ar: "الطور", start_ayah: 24, end_ayah: 31, page: 523, points: 5 },
    // id: 214
    { id: 214, surah_number: 52, surah_name_ar: "الطور", start_ayah: 32, end_ayah: 43, page: 523, points: 5 },
    // id: 215
    { id: 215, surah_number: 52, surah_name_ar: "الطور", start_ayah: 44, end_ayah: 49, page: 523, points: 5 },
    // id: 216
    { id: 216, surah_number: 51, surah_name_ar: "الذاريات", start_ayah: 1, end_ayah: 23, page: 520, points: 5 },
    // id: 217
    { id: 217, surah_number: 51, surah_name_ar: "الذاريات", start_ayah: 24, end_ayah: 30, page: 520, points: 5 },
    // id: 218
    { id: 218, surah_number: 51, surah_name_ar: "الذاريات", start_ayah: 31, end_ayah: 42, page: 520, points: 5 },
    // id: 219
    { id: 219, surah_number: 51, surah_name_ar: "الذاريات", start_ayah: 43, end_ayah: 51, page: 520, points: 5 },
    // id: 220
    { id: 220, surah_number: 51, surah_name_ar: "الذاريات", start_ayah: 52, end_ayah: 60, page: 520, points: 5 },
    // id: 221
    { id: 221, surah_number: 50, surah_name_ar: "ق", start_ayah: 1, end_ayah: 8, page: 518, points: 5 },
    // id: 222
    { id: 222, surah_number: 50, surah_name_ar: "ق", start_ayah: 9, end_ayah: 15, page: 518, points: 5 },
    // id: 223
    { id: 223, surah_number: 50, surah_name_ar: "ق", start_ayah: 16, end_ayah: 30, page: 518, points: 5 },
    // id: 224
    { id: 224, surah_number: 50, surah_name_ar: "ق", start_ayah: 31, end_ayah: 38, page: 518, points: 5 },
    // id: 225
    { id: 225, surah_number: 50, surah_name_ar: "ق", start_ayah: 39, end_ayah: 45, page: 518, points: 5 },
    // id: 226
    { id: 226, surah_number: 49, surah_name_ar: "الحجرات", start_ayah: 1, end_ayah: 4, page: 515, points: 5 },
    // id: 227
    { id: 227, surah_number: 49, surah_name_ar: "الحجرات", start_ayah: 5, end_ayah: 8, page: 515, points: 5 },
    // id: 228
    { id: 228, surah_number: 49, surah_name_ar: "الحجرات", start_ayah: 9, end_ayah: 11, page: 515, points: 5 },
    // id: 229
    { id: 229, surah_number: 49, surah_name_ar: "الحجرات", start_ayah: 12, end_ayah: 14, page: 515, points: 5 },
    // id: 230
    { id: 230, surah_number: 49, surah_name_ar: "الحجرات", start_ayah: 15, end_ayah: 18, page: 515, points: 5 },
    // id: 231
    { id: 231, surah_number: 48, surah_name_ar: "الفتح", start_ayah: 1, end_ayah: 5, page: 511, points: 5 },
    // id: 232
    { id: 232, surah_number: 48, surah_name_ar: "الفتح", start_ayah: 6, end_ayah: 9, page: 511, points: 5 },
    // id: 233
    { id: 233, surah_number: 48, surah_name_ar: "الفتح", start_ayah: 10, end_ayah: 13, page: 511, points: 5 },
    // id: 234
    { id: 234, surah_number: 48, surah_name_ar: "الفتح", start_ayah: 14, end_ayah: 15, page: 511, points: 5 },
    // id: 235
    { id: 235, surah_number: 48, surah_name_ar: "الفتح", start_ayah: 16, end_ayah: 19, page: 511, points: 5 },
    // id: 236
    { id: 236, surah_number: 48, surah_name_ar: "الفتح", start_ayah: 20, end_ayah: 23, page: 511, points: 5 },
    // id: 237
    { id: 237, surah_number: 48, surah_name_ar: "الفتح", start_ayah: 24, end_ayah: 26, page: 511, points: 5 },
    // id: 238
    { id: 238, surah_number: 48, surah_name_ar: "الفتح", start_ayah: 27, end_ayah: 28, page: 511, points: 5 },
    // id: 239
    { id: 239, surah_number: 48, surah_name_ar: "الفتح", start_ayah: 29, end_ayah: 29, page: 511, points: 5 },
    // id: 240
    { id: 240, surah_number: 47, surah_name_ar: "محمد", start_ayah: 1, end_ayah: 6, page: 507, points: 5 },
    // id: 241
    { id: 241, surah_number: 47, surah_name_ar: "محمد", start_ayah: 7, end_ayah: 11, page: 507, points: 5 },
    // id: 242
    { id: 242, surah_number: 47, surah_name_ar: "محمد", start_ayah: 12, end_ayah: 15, page: 507, points: 5 },
    // id: 243
    { id: 243, surah_number: 47, surah_name_ar: "محمد", start_ayah: 16, end_ayah: 19, page: 507, points: 5 },
    // id: 244
    { id: 244, surah_number: 47, surah_name_ar: "محمد", start_ayah: 20, end_ayah: 24, page: 507, points: 5 },
    // id: 245
    { id: 245, surah_number: 47, surah_name_ar: "محمد", start_ayah: 25, end_ayah: 29, page: 507, points: 5 },
    // id: 246
    { id: 246, surah_number: 47, surah_name_ar: "محمد", start_ayah: 30, end_ayah: 34, page: 507, points: 5 },
    // id: 247
    { id: 247, surah_number: 47, surah_name_ar: "محمد", start_ayah: 35, end_ayah: 38, page: 507, points: 5 },
    // id: 248
    { id: 248, surah_number: 46, surah_name_ar: "الأحقاف", start_ayah: 1, end_ayah: 5, page: 502, points: 5 },
    // id: 249
    { id: 249, surah_number: 46, surah_name_ar: "الأحقاف", start_ayah: 6, end_ayah: 10, page: 502, points: 5 },
    // id: 250
    { id: 250, surah_number: 46, surah_name_ar: "الأحقاف", start_ayah: 11, end_ayah: 14, page: 502, points: 5 },
    // id: 251
    { id: 251, surah_number: 46, surah_name_ar: "الأحقاف", start_ayah: 15, end_ayah: 16, page: 502, points: 5 },
    // id: 252
    { id: 252, surah_number: 46, surah_name_ar: "الأحقاف", start_ayah: 17, end_ayah: 20, page: 502, points: 5 },
    // id: 253
    { id: 253, surah_number: 46, surah_name_ar: "الأحقاف", start_ayah: 21, end_ayah: 25, page: 502, points: 5 },
    // id: 254
    { id: 254, surah_number: 46, surah_name_ar: "الأحقاف", start_ayah: 26, end_ayah: 28, page: 502, points: 5 },
    // id: 255
    { id: 255, surah_number: 46, surah_name_ar: "الأحقاف", start_ayah: 29, end_ayah: 32, page: 502, points: 5 },
    // id: 256
    { id: 256, surah_number: 46, surah_name_ar: "الأحقاف", start_ayah: 33, end_ayah: 35, page: 502, points: 5 },
    // id: 257 (الفاتحة كنهاية للحفظ)
    { id: 257, surah_number: 1, surah_name_ar: "الفاتحة", start_ayah: 1, end_ayah: 7, page: 1, points: 5 },
];


// =========================================================================
// 2. REVIEW_CURRICULUM: تفاصيل مهام المراجعة المنسقة (REVIEW_CURRICULUM)
// =========================================================================
// تم تحويل مصفوفات الأسماء إلى كائنات لتضمين حقل 'points' (نقاط المراجعة = 3).

const REVIEW_CURRICULUM = {
    // -----------------------------------------------------------------------------------------------------------------------------------
    // A. BUILDING: مستوى البناء (نقاط المراجعة 3)
    // -----------------------------------------------------------------------------------------------------------------------------------
    BUILDING: [
        { name: "الطارق", points: 3 },
        { name: "الأعلى", points: 3 },
        { name: "الغاشية", points: 3 },
        { name: "الفجر (1-16)", points: 3 },
        { name: "الفجر (17-30)", points: 3 },
        { name: "البلد", points: 3 },
        { name: "الشمس", points: 3 },
        { name: "الليل", points: 3 },
        { name: "الضحى والشرح", points: 3 },
        { name: "التين", points: 3 },
        { name: "العلق", points: 3 },
        { name: "القدر", points: 3 },
        { name: "البينة", points: 3 },
        { name: "الزلزلة والعاديات", points: 3 },
        { name: "القارعة والتكاثر", points: 3 },
        { name: "العصر والهمزة والفيل", points: 3 },
        { name: "قريش والماعون والكوثر", points: 3 },
        { name: "الكافرون والنصر والمسد", points: 3 },
        { name: "الإخلاص والفلق والناس", points: 3 },
    ],

    // -----------------------------------------------------------------------------------------------------------------------------------
    // B. DEVELOPMENT: مستوى التطوير (نقاط المراجعة 3)
    // -----------------------------------------------------------------------------------------------------------------------------------
    DEVELOPMENT: [
        { name: "القلم (1-33)", points: 3 },
        { name: "القلم (34-52)", points: 3 },
        { name: "الحاقة (1-24)", points: 3 },
        { name: "الحاقة (25-52)", points: 3 },
        { name: "المعارج (1-28)", points: 3 },
        { name: "المعارج (29-44)", points: 3 },
        { name: "نوح (1-20)", points: 3 },
        { name: "نوح (21-28)", points: 3 },
        { name: "الجن (1-13)", points: 3 },
        { name: "الجن (14-28)", points: 3 },
        { name: "المزمل", points: 3 },
        { name: "المدثر (1-31)", points: 3 },
        { name: "المدثر (32-56)", points: 3 },
        { name: "القيامة (1-19)", points: 3 },
        { name: "القيامة (20-40)", points: 3 },
        { name: "الإنسان (1-18)", points: 3 },
        { name: "الإنسان (19-31)", points: 3 },
        { name: "المرسلات (1-33)", points: 3 },
        { name: "المرسلات (34-50)", points: 3 },
        { name: "النبأ (1-20)", points: 3 },
        { name: "النبأ (21-40)", points: 3 },
        { name: "النازعات (1-26)", points: 3 },
        { name: "النازعات (27-46)", points: 3 },
        { name: "عبس (1-23)", points: 3 },
        { name: "عبس (24-42)", points: 3 },
        { name: "التكوير (1-14)", points: 3 },
        { name: "التكوير (15-29)", points: 3 },
        { name: "الانفطار", points: 3 },
        { name: "المطففين (1-21)", points: 3 },
        { name: "المطففين (22-36)", points: 3 },
        { name: "الانشقاق", points: 3 },
        { name: "البروج والطارق", points: 3 },
        { name: "الأعلى والغاشية", points: 3 },
        { name: "الفجر والبلد", points: 3 },
        { name: "الشمس والليل والضحى والشرح", points: 3 },
        { name: "التين والعلق والقدر والبينة", points: 3 },
        { name: "الزلزلة إلى الناس", points: 3 },
    ],

    // -----------------------------------------------------------------------------------------------------------------------------------
    // C. ADVANCED: مستوى المتقدم (نقاط المراجعة 3)
    // -----------------------------------------------------------------------------------------------------------------------------------
    ADVANCED: [
        { name: "الأحقاف (1-16)", points: 3 },
        { name: "الأحقاف (17-35)", points: 3 },
        { name: "محمد (1-19)", points: 3 },
        { name: "محمد (20-38)", points: 3 },
        { name: "الفتح (1-15)", points: 3 },
        { name: "الفتح (16-29)", points: 3 },
        { name: "الحجرات", points: 3 },
        { name: "ق", points: 3 },
        { name: "الذاريات", points: 3 },
        { name: "الطور", points: 3 },
        { name: "النجم", points: 3 },
        { name: "القمر", points: 3 },
        { name: "الرحمن", points: 3 },
        { name: "الواقعة", points: 3 },
        { name: "الحديد (1-18)", points: 3 },
        { name: "الحديد (19-29)", points: 3 },
        { name: "المجادلة (1-12)", points: 3 },
        { name: "المجادلة (13-22)", points: 3 },
        { name: "الحشر (1-12)", points: 3 },
        { name: "الحشر (13-24)", points: 3 },
        { name: "الممتحنة (1-7)", points: 3 },
        { name: "الممتحنة (8-13)", points: 3 },
        { name: "الصف", points: 3 },
        { name: "الجمعة", points: 3 },
        { name: "المنافقون", points: 3 },
        { name: "التغابن", points: 3 },
        { name: "الطلاق", points: 3 },
        { name: "التحريم", points: 3 },
        { name: "الملك", points: 3 },
        { name: "القلم", points: 3 },
        { name: "الحاقة", points: 3 },
        { name: "المعارج", points: 3 },
        { name: "نوح", points: 3 },
        { name: "الجن", points: 3 },
        { name: "المزمل", points: 3 },
        { name: "المدثر", points: 3 },
        { name: "القيامة", points: 3 },
        { name: "الإنسان", points: 3 },
        { name: "المرسلات", points: 3 },
        { name: "النبأ", points: 3 },
        { name: "النازعات", points: 3 },
        { name: "عبس والتكوير", points: 3 },
        { name: "الإنفطار والمطففين", points: 3 },
        { name: "الإنشقاق والبروج", points: 3 },
        { name: "الطارق إلى الفجر", points: 3 },
        { name: "البلد إلى الناس", points: 3 },
    ],
};

// =========================================================================
// 3. LEVEL_CONFIG: تعريف المستويات وخصائصها (CURRICULUM_LEVELS)
// =========================================================================
// تم دمج خصائص المستويات وتصحيحها لتصبح كائنًا واحدًا لتسهيل الاستخدام.

const LEVEL_CONFIG = {
    // مستويات الحفظ (لتحديد 1x, 2x, 3x)
    HIFZ_LEVEL_MULTIPLIERS: [
        { id: 1, name: "مقطع واحد (1x)", multiplier: 1 },
        { id: 2, name: "مقطعين (2x)", multiplier: 2 },
        { id: 3, name: "ثلاثة مقاطع (3x)", multiplier: 3 },
    ],
    // مستويات المراجعة (لربطها بمصفوفات REVIEW_CURRICULUM)
    MURJAA_LEVELS_MAPPING: {
        BUILDING: { id: "BUILDING", name: "البناء", hifz_label: "حفظ: من سورة الناس إلى سورة البروج" },
        DEVELOPMENT: { id: "DEVELOPMENT", name: "التطوير", hifz_label: "حفظ: من سورة الانشقاق إلى سورة الملك" },
        ADVANCED: { id: "ADVANCED", name: "المتقدم", hifz_label: "حفظ: من سورة التحريم إلى سورة المجادلة" },
        COMPLETION: { id: "COMPLETION", name: "إكمال المنهج", hifz_label: "أكمل حفظ المنهج" }
    }
};

// =========================================================================
// التصدير (Exports)
// =========================================================================
// تصدير جميع الثوابت الجديدة لاستخدامها في app.js
export { HIFZ_CURRICULUM, REVIEW_CURRICULUM, LEVEL_CONFIG };
