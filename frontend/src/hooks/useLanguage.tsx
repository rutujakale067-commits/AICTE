import React, { createContext, useContext, useState, ReactNode } from "react";

export interface LanguageOption {
  code: string;
  native: string;
  name: string;
}

export const INDIAN_LANGUAGES: LanguageOption[] = [
  { code: "en", native: "English", name: "English" },
  { code: "hi", native: "हिन्दी", name: "Hindi" },
  { code: "mr", native: "मराठी", name: "Marathi" },
  { code: "ta", native: "தமிழ்", name: "Tamil" },
  { code: "te", native: "తెలుగు", name: "Telugu" },
  { code: "kn", native: "ಕನ್ನಡ", name: "Kannada" },
  { code: "bn", native: "বাংলা", name: "Bengali" },
  { code: "gu", native: "ગુજરાતી", name: "Gujarati" },
  { code: "ml", native: "മലയാളം", name: "Malayalam" },
  { code: "pa", native: "ਪੰਜਾਬੀ", name: "Punjabi" },
  { code: "or", native: "ଓଡ଼ିଆ", name: "Odia" },
  { code: "as", native: "অসমীয়া", name: "Assamese" },
  { code: "sa", native: "संस्कृतम्", name: "Sanskrit" },
  { code: "ur", native: "اردو", name: "Urdu" },
  { code: "mai", native: "मैथिली", name: "Maithili" },
  { code: "doi", native: "डोगरी", name: "Dogri" },
  { code: "brx", native: "बोडो", name: "Bodo" },
  { code: "sat", native: "संथाली", name: "Santali" },
  { code: "ne", native: "नेपाली", name: "Nepali" },
  { code: "kok", native: "कोंकणी", name: "Konkani" },
  { code: "sd", native: "सिन्धी", name: "Sindhi" },
  { code: "ks", native: "कश्मीरी", name: "Kashmiri" },
];

export const TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    portal_title: "Official Scrutiny Portal for Extension of Approval (EoA)",
    signin_title: "Official Portal Sign In",
    signin_btn: "Sign In to Scrutiny Portal",
    username: "Official User ID / Username",
    password: "Password",
    handbook_banner: "Approval Process Handbook (APH 2024–2027) Regulatory Scrutiny & Compliance Verification System",
    quick_fill: "Quick-Fill Demo Roles",
    workplace: "Officer Workplace",
    active_session: "Active Officer Session",
    applications: "Applications",
    scrutiny: "Scrutiny Checks",
    select_lang: "Select Language",
    click_to_fill: "Click to fill",
    handbook_rule: "Handbook Rule Cross-Check",
    evidence_linked: "Evidence-Linked Findings",
    ocr_extraction: "OCR & Text Layer Extraction",
    audit_integrity: "Immutable Audit Integrity",
  },
  hi: {
    portal_title: "विस्तार अनुमोदन (EoA) आधिकारिक संवीक्षा पोर्टल",
    signin_title: "आधिकारिक पोर्टल साइन इन",
    signin_btn: "संवीक्षा पोर्टल में साइन इन करें",
    username: "आधिकारिक उपयोगकर्ता आईडी / नाम",
    password: "पासवर्ड",
    handbook_banner: "अनुमोदन प्रक्रिया पुस्तिका (APH 2024–2027) विनियामक संवीक्षा एवं अनुपालन सत्यापन प्रणाली",
    quick_fill: "त्वरित डेमो भूमिकाएँ चुनें",
    workplace: "अधिकारी कार्यस्थल",
    active_session: "सक्रिय अधिकारी सत्र",
    applications: "आवेदन",
    scrutiny: "संवीक्षा जाँच",
    select_lang: "भाषा चुनें",
    click_to_fill: "चयन के लिए क्लिक करें",
    handbook_rule: "हैंडबुक नियम क्रॉस-चेक",
    evidence_linked: "प्रमाण-लिंक्ड निष्कर्ष",
    ocr_extraction: "ओसीआर एवं पाठ्य परत निष्कर्षण",
    audit_integrity: "अपरिवर्तनीय ऑडिट अखंडता",
  },
  mr: {
    portal_title: "विस्तार मान्यता (EoA) अधिकृत छाननी पोर्टल",
    signin_title: "अधिकृत पोर्टल साइन इन",
    signin_btn: "छाननी पोर्टलवर साइन इन करा",
    username: "अधिकृत युझर आयडी / नाव",
    password: "पासवर्ड",
    handbook_banner: "मान्यता प्रक्रिया पुस्तिका (APH 2024–2027) नियामक छाननी आणि अनुपालन पडताळणी प्रणाली",
    quick_fill: "डेमो भूमिका निवडा",
    workplace: "अधिकारी कार्यक्षेत्र",
    active_session: "सक्रिय अधिकारी सत्र",
    applications: "अर्ज",
    scrutiny: "छाननी तपासणी",
    select_lang: "भाषा निवडा",
    click_to_fill: "निवडण्यासाठी क्लिक करा",
    handbook_rule: "हँडबुक नियम क्रॉस-चेक",
    evidence_linked: "पुरावा-आधारित निष्कर्ष",
    ocr_extraction: "ओसीआर आणि मजकूर काढणे",
    audit_integrity: "अखंड ऑडिट नोंद",
  },
  ta: {
    portal_title: "அங்கீகார விரிவாக்கம் (EoA) அதிகாரப்பூர்வ சரிபார்ப்பு போர்டல்",
    signin_title: "அதிகாரப்பூர்வ உள்நுழைவு",
    signin_btn: "சரிபார்ப்பு போர்ட்டலில் உள்நுழைக",
    username: "அதிகாரப்பூர்வ பயனர் ஐடி",
    password: "கடவுச்சொல்",
    handbook_banner: "அங்கீகார செயல்முறை கையேடு (APH 2024–2027) ஒழுங்குமுறை ஆய்வு மற்றும் இணக்க சரிபார்ப்பு முறை",
    quick_fill: "டெமோ கணக்குகளை தேர்வு செய்க",
    workplace: "அதிகாரி பணிமனை",
    active_session: "செயலில் உள்ள அதிகாரி அமர்வு",
    applications: "விண்ணப்பங்கள்",
    scrutiny: "சரிபார்ப்பு சோதனைகள்",
    select_lang: "மொழியைத் தேர்ந்தெடுக்கவும்",
    click_to_fill: "நிரப்ப கிளிக் செய்க",
    handbook_rule: "கையேடு விதி சரிபார்ப்பு",
    evidence_linked: "ஆதாரம் சார்ந்த கண்டுபிடிப்புகள்",
    ocr_extraction: "ஓசிஆர் உரை பிரித்தெடுத்தல்",
    audit_integrity: "மாற்ற முடியாத தணிக்கை நாணயம்",
  },
  te: {
    portal_title: "ఆమోద విస్తరణ (EoA) అధికారిక పరిశీలన పోర్టల్",
    signin_title: "అధికారిక పోర్టల్ సైన్ ఇన్",
    signin_btn: "పరిశీలన పోర్టల్‌లోకి సైన్ ఇన్ చేయండి",
    username: "అధికారిక వినియోగదారు ID",
    password: "పాస్‌వర్డ్",
    handbook_banner: "ఆమోద ప్రక్రియ హ్యాండ్‌బుక్ (APH 2024–2027) నియంత్రణ పరిశీలన మరియు వర్తింపు ధృవీకరణ వ్యవస్థ",
    quick_fill: "డెమో పాత్రలను ఎంచుకోండి",
    workplace: "అధికారి కార్యాలయం",
    active_session: "క్రియాశీల అధికారి సెషన్",
    applications: "దరఖాస్తులు",
    scrutiny: "పరిశీలన తనిఖీలు",
    select_lang: "భాషను ఎంచుకోండి",
    click_to_fill: "పూరించడానికి క్లిక్ చేయండి",
    handbook_rule: "హ్యాండ్‌బుక్ నియమ క్రాస్-చెక్",
    evidence_linked: "సాక్ష్య-ఆధారిత పరిశీలనలు",
    ocr_extraction: "ఓసిఆర్ టెక్స్ట్ ఎక్స్‌ట్రాక్షన్",
    audit_integrity: "మార్చలేని ఆడిట్ సమగ్రత",
  },
  kn: {
    portal_title: "ವಿಸ್ತರಣಾ ಅನುಮೋದನೆ (EoA) ಅಧಿಕೃತ ಪರಿಶೀಲನಾ ಪೋರ್ಟಲ್",
    signin_title: "ಅಧಿಕೃತ ಪೋರ್ಟಲ್ ಸೈನ್ ಇನ್",
    signin_btn: "ಪರಿಶೀಲನಾ ಪೋರ್ಟಲ್‌ಗೆ ಸೈನ್ ಇನ್ ಮಾಡಿ",
    username: "ಅಧಿಕೃತ ಬಳಕೆದಾರ ಐಡಿ",
    password: "ಪಾಸ್‌ವರ್ಡ್",
    handbook_banner: "ಅನುಮೋದನೆ ಪ್ರಕ್ರಿಯೆ ಕೈಪಿಡಿ (APH 2024–2027) ನಿಯಂತ್ರಕ ಪರಿಶೀಲನೆ ಮತ್ತು ಅನುಸರಣೆ ಪರಿಶೀಲನಾ ವ್ಯವಸ್ಥೆ",
    quick_fill: "ಡೆಮೊ ಪಾತ್ರಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    workplace: "ಅಧಿಕಾರಿ ಕಾರ್ಯಕ್ಷೇತ್ರ",
    active_session: "ಸಕ್ರಿಯ ಅಧಿಕಾರಿ ಸೆಷನ್",
    applications: "ಅರ್ಜಿಗಳು",
    scrutiny: "ಪರಿಶೀಲನಾ ತಪಾಸಣೆಗಳು",
    select_lang: "ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    click_to_fill: "ಭರ್ತಿ ಮಾಡಲು ಕ್ಲಿಕ್ ಮಾಡಿ",
    handbook_rule: "ಕೈಪಿಡಿ ನಿಯಮ ಕ್ರಾಸ್-ಚೆಕ್",
    evidence_linked: "ಸಾಕ್ಷ್ಯ-ಆಧಾರಿತ ಸಂಶೋಧನೆಗಳು",
    ocr_extraction: "ಓಸಿಆರ್ ಪಠ್ಯ ಹೊರತೆಗೆಯುವಿಕೆ",
    audit_integrity: "ಬದಲಾಯಿಸಲಾಗದ ಲೆಕ್ಕಪರಿಶೋಧನೆ",
  },
  bn: {
    portal_title: "অনুমোদন সম্প্রসারণ (EoA) অফিসিয়াল স্ক্রুটিনি পোর্টাল",
    signin_title: "অফিসিয়াল পোর্টাল সাইন ইন",
    signin_btn: "স্ক্রুটিনি পোর্টালে সাইন ইন করুন",
    username: "অফিসিয়াল ইউজার আইডি",
    password: "পাসওয়ার্ড",
    handbook_banner: "অনুমোদন প্রক্রিয়া হ্যান্ডবুক (APH 2024–2027) নিয়ন্ত্রক স্ক্রুটিনি এবং সম্মতি যাচাইকরণ ব্যবস্থা",
    quick_fill: "ডেমো ভূমিকা নির্বাচন করুন",
    workplace: "অফিসার কর্মক্ষেত্র",
    active_session: "সক্রিয় অফিসার সেশন",
    applications: "আবেদনপত্র",
    scrutiny: "স্ক্রুটিনি পরীক্ষা",
    select_lang: "ভাষা নির্বাচন করুন",
    click_to_fill: "পূরণ করতে ক্লিক করুন",
    handbook_rule: "হ্যান্ডবুক নিয়ম ক্রস-চেক",
    evidence_linked: "প্রমাণ-সংযুক্ত অনুসন্ধান",
    ocr_extraction: "ওসিআর টেক্সট নিষ্কাশন",
    audit_integrity: "অপরিবর্তনীয় অডিট সততা",
  },
  gu: {
    portal_title: "મંજૂરી વિસ્તરણ (EoA) અધિકૃત ચકાસણી પોર્ટલ",
    signin_title: "અધિકૃત પોર્ટલ સાઇન ઇન",
    signin_btn: "ચકાસણી પોર્ટલ પર સાઇન ઇન કરો",
    username: "અધિકૃત યુઝર આઈડી",
    password: "પાસવર્ડ",
    handbook_banner: "મંજૂરી પ્રક્રિયા પુસ્તિકા (APH 2024–2027) નિયમનકારી ચકાસણી અને પાલન પ્રમાણીકરણ પ્રણાલી",
    quick_fill: "ડેમો ભૂમિકાઓ પસંદ કરો",
    workplace: "અધિકારી કાર્યસ્થળ",
    active_session: "સક્રિય અધિકારી સત્ર",
    applications: "અરજીઓ",
    scrutiny: "ચકાસણી તપાસ",
    select_lang: "ભાષા પસંદ કરો",
    click_to_fill: "ભરવા માટે ક્લિક કરો",
    handbook_rule: "હેન્ડબુક નિયમ ક્રોસ-ચેક",
    evidence_linked: "પુરાવા-જોડાયેલ તારણો",
    ocr_extraction: "ઓસીઆર ટેક્સ્ટ એક્સટ્રેક્શન",
    audit_integrity: "અપરિવર્તનીય ઓડિટ અખંડિતતા",
  },
};

interface LanguageContextType {
  language: string;
  setLanguage: (code: string) => void;
  currentLang: LanguageOption;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  currentLang: INDIAN_LANGUAGES[0],
  t: (key: string) => key,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<string>(() => {
    return localStorage.getItem("aicte_lang") || "en";
  });

  const setLanguage = (code: string) => {
    setLanguageState(code);
    localStorage.setItem("aicte_lang", code);
  };

  const currentLang =
    INDIAN_LANGUAGES.find((l) => l.code === language) || INDIAN_LANGUAGES[0];

  const t = (key: string): string => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS["en"]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, currentLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
