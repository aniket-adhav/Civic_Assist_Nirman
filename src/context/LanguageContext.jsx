import { createContext, useContext, useMemo, useState } from 'react';

const STORAGE_KEY = 'ca_language';

const LANGUAGE_OPTIONS = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी (Hindi)' },
  { code: 'mr', label: 'मराठी (Marathi)' },
];

const CATEGORY_LABELS = {
  garbage: { en: 'Garbage', hi: 'कचरा', mr: 'कचरा' },
  streetlight: { en: 'Streetlight', hi: 'स्ट्रीटलाइट', mr: 'रस्त्यावरील दिवे' },
  water: { en: 'Water Issue', hi: 'पानी समस्या', mr: 'पाणी समस्या' },
  road: { en: 'Road Damage', hi: 'सड़क क्षति', mr: 'रस्त्याचे नुकसान' },
  park: { en: 'Park & Green', hi: 'पार्क और हरियाली', mr: 'उद्यान आणि हरित क्षेत्र' },
  sewage: { en: 'Sewage', hi: 'सीवेज', mr: 'सांडपाणी' },
  electricity: { en: 'Electricity', hi: 'बिजली', mr: 'वीज' },
  noise: { en: 'Noise Pollution', hi: 'ध्वनि प्रदूषण', mr: 'ध्वनी प्रदूषण' },
  other: { en: 'Other', hi: 'अन्य', mr: 'इतर' },
};

const STATUS_LABELS = {
  all: { en: 'All', hi: 'सभी', mr: 'सर्व' },
  open: { en: 'Open', hi: 'खुला', mr: 'खुली' },
  pending: { en: 'Pending', hi: 'लंबित', mr: 'प्रलंबित' },
  inprogress: { en: 'In Progress', hi: 'प्रगति में', mr: 'काम सुरू' },
  resolved: { en: 'Resolved', hi: 'सुलझा', mr: 'निकाली' },
  unread: { en: 'Unread', hi: 'अपठित', mr: 'न वाचलेले' },
};

const translations = {
  en: {
    login: {
      signIn: 'Sign in',
      enterMobile: 'Enter your mobile number to get started.',
      mobileNumber: 'Mobile Number',
      continue: 'Continue',
      sending: 'Sending...',
      termsPrefix: 'By continuing you agree to our',
      terms: 'Terms of Service',
      officialPrompt: 'Are you a government official?',
      adminPortal: 'Access Admin Portal',
      back: 'Back',
      verifyOtp: 'Verify OTP',
      enterOtpFor: 'Enter any 6-digit code for',
      verifyContinue: 'Verify & Continue',
      verifying: 'Verifying...',
      resendIn: 'Resend in',
      resendOtp: 'Resend OTP',
      whatsYourName: "What's your name?",
      nameHelp: 'This will appear on your posts in the community feed.',
      yourName: 'Your Name',
      letsGo: "Let's Go",
      saving: 'Saving...',
      errors: {
        invalidPhone: 'Please enter a valid 10-digit number',
        sendOtpFailed: 'Failed to send OTP',
        incompleteOtp: 'Please enter the complete 6-digit OTP',
        generic: 'Something went wrong',
        enterName: 'Please enter your name',
        saveNameFailed: 'Failed to save name',
      },
    },
    settings: {
      title: 'Settings',
      general: 'General',
      language: 'Language',
      change: 'Change',
      languageSet: 'Language set to',
    },
    common: {
      loading: 'Loading...',
      share: 'Share',
      save: 'Save',
      cancel: 'Cancel',
      close: 'Close',
      delete: 'Delete',
      callNow: 'Call now',
      copyNumber: 'Copy number',
    },
    sidebar: {
      feed: 'Community Feed',
      report: 'Report Issue',
      myReports: 'My Reports',
      helplines: 'Helplines',
      notifications: 'Notifications',
      leaderboard: 'Leaderboard',
      settings: 'Settings',
      lightMode: 'Light Mode',
      darkMode: 'Dark Mode',
      logout: 'Logout',
    },
    leaderboard: {
      pulse: 'Citizen Champions',
      title: 'Top Contributors Leaderboard',
      subtitle: 'Users with the highest civic impact based on issue reports and follow-through.',
      rank: 'Rank',
      reports: 'Reports',
      resolved: 'Resolved',
      topTen: 'Rankings 4 - 10',
    },
    feed: {
      searchPlaceholder: 'Search issues by title, description, or location...',
      pulse: 'Community Pulse',
      trending: 'Trending Issues',
      noIssues: 'No issues found',
      tryFilter: 'Try changing the filter or search query',
      reportIssue: 'Report Issue',
      supporters: 'Supporters',
      supported: 'Supported',
      supportIssue: 'Support Issue',
    },
    report: {
      title: 'Report an Issue',
      category: 'Category',
      issueTitle: 'Issue Title',
      issueTitlePlaceholder: 'Brief title describing the issue',
      description: 'Description',
      descriptionPlaceholder: 'Detailed description of the issue...',
      location: 'Location',
      useMyLocation: 'Use My Location',
      hideMap: 'Hide Map',
      pickOnMap: 'Pick on Map',
      detectingAddress: 'Detecting address...',
      searchAddress: 'Search or type address...',
      preciseLocation: 'Precise Location',
      detecting: 'Detecting...',
      tapMapToPin: 'Tap map to pin',
      clickMapHelp: 'Click anywhere on the map to drop a pin',
      photo: 'Photo',
      required: '(required)',
      clickUpload: 'Click to upload photo',
      photoHelp: 'A photo helps verify and prioritise the issue',
      submitting: 'Submitting...',
      submit: 'Submit Report',
      errors: {
        titleRequired: 'Title is required',
        descriptionRequired: 'Description is required',
        categoryRequired: 'Select a category',
        locationRequired: 'Location is required',
        photoRequired: 'Photo is required',
        submitFailed: 'Failed to submit. Please try again.',
      },
    },
    myReports: {
      title: 'My Reports',
      submitted: 'submitted',
      newReport: 'New Report',
      noReports: 'No reports yet',
      noStatusReports: 'No {{status}} reports',
      issuesAppearHere: 'Issues you report will appear here',
      tryDifferentFilter: 'Try a different filter',
      reportIssue: 'Report an Issue',
      share: 'Share',
      deleteReport: 'Delete this report?',
      deleteHelp: 'This action cannot be undone. The report will be permanently removed.',
      deleted: 'Report deleted',
      copied: 'Report link copied to clipboard!',
    },
    issueCard: {
      moreOptions: 'More options',
      viewDetails: 'View details',
      copyLocation: 'Copy location',
      sharePost: 'Share post',
      issue: 'Issue',
      issueCopied: 'Issue details copied to clipboard',
      locationCopied: 'Location copied',
    },
    issueDetail: {
      notSelected: 'Issue not selected',
      selectFromFeed: 'Choose a post from the community feed to view details.',
      backToFeed: 'Back to Feed',
      reported: 'Reported',
      viewImage: 'View Image',
      detailedDescription: 'Detailed Description',
      reportedBy: 'Reported by',
      supporters: 'Supporters',
      discussion: 'Discussion',
      citizens: 'citizens',
      comments: 'Comments',
      prioritySignal: 'Community priority signal',
      priorityHelp: 'Higher support helps this report stand out in the community feed and encourages faster civic attention.',
      area: 'Area',
      priority: 'Priority',
      high: 'High',
      rising: 'Rising',
      normal: 'Normal',
      impactSupport: 'Impact & Community Support',
      impactHelp: 'Support this issue to help neighbors show urgency and keep the report visible.',
      supportThis: 'Support this Issue',
      communityReach: 'Community reach',
      views: 'views',
      momentum: 'Momentum',
      strong: 'Strong',
      growing: 'Growing',
      communityDiscussion: 'Community Discussion',
      addCommentPlaceholder: 'Provide an update or ask a question...',
      postComment: 'Post Comment',
      noComments: 'No comments yet. Start the discussion for this issue.',
      reply: 'Reply',
      replyTo: 'Reply to {{user}}...',
      post: 'Post',
      closeImage: 'Close image',
      expandMap: 'Expand map',
      issueCopied: 'Issue details copied to clipboard',
      commentPosted: 'Comment posted',
      replyPosted: 'Reply posted',
    },
    notifications: {
      title: 'Notifications',
      unread: 'unread',
      markAllRead: 'Mark all read',
      allCaughtUp: 'All caught up!',
      noNow: 'No {{prefix}}notifications right now',
      navigating: 'Navigating to issue...',
      markAsRead: 'Mark as read',
      dismiss: 'Dismiss',
    },
    comments: {
      title: 'Comments',
      noCommentsYet: 'No comments yet. Be the first!',
      addComment: 'Add a comment...',
    },
    helplines: {
      quickAccess: 'Quick Access',
      title: 'Helplines',
      subtitle: 'Emergency numbers and civic service contacts - tap to call instantly.',
      emergencyNumbers: 'Emergency Numbers',
      searchPlaceholder: 'Search helplines or services...',
      municipalServices: 'Municipal Services',
      noFound: 'No helplines found for "{{search}}"',
      contacts: 'contacts',
      contact: 'contact',
      proTip: 'Pro Tip',
      tipText: 'Always report the issue in the app first, then call the relevant helpline with your report ID. This creates an official record that authorities must respond to.',
    },
  },
  hi: {
    login: {
      signIn: 'साइन इन',
      enterMobile: 'शुरू करने के लिए अपना मोबाइल नंबर दर्ज करें।',
      mobileNumber: 'मोबाइल नंबर',
      continue: 'जारी रखें',
      sending: 'भेजा जा रहा है...',
      termsPrefix: 'जारी रखकर आप हमारी',
      terms: 'सेवा की शर्तों',
      officialPrompt: 'क्या आप सरकारी अधिकारी हैं?',
      adminPortal: 'एडमिन पोर्टल खोलें',
      back: 'वापस',
      verifyOtp: 'OTP सत्यापित करें',
      enterOtpFor: 'इसके लिए कोई भी 6-अंकों का कोड दर्ज करें',
      verifyContinue: 'सत्यापित करें और जारी रखें',
      verifying: 'सत्यापित किया जा रहा है...',
      resendIn: 'फिर से भेजें',
      resendOtp: 'OTP फिर भेजें',
      whatsYourName: 'आपका नाम क्या है?',
      nameHelp: 'यह कम्युनिटी फीड में आपकी पोस्ट पर दिखेगा।',
      yourName: 'आपका नाम',
      letsGo: 'आगे बढ़ें',
      saving: 'सहेजा जा रहा है...',
      errors: {
        invalidPhone: 'कृपया सही 10-अंकों का नंबर दर्ज करें',
        sendOtpFailed: 'OTP भेजने में विफल',
        incompleteOtp: 'कृपया पूरा 6-अंकों का OTP दर्ज करें',
        generic: 'कुछ गलत हो गया',
        enterName: 'कृपया अपना नाम दर्ज करें',
        saveNameFailed: 'नाम सहेजने में विफल',
      },
    },
    settings: {
      title: 'सेटिंग्स',
      general: 'सामान्य',
      language: 'भाषा',
      change: 'बदलें',
      languageSet: 'भाषा सेट की गई',
    },
    common: {
      loading: 'लोड हो रहा है...',
      share: 'शेयर',
      save: 'सेव करें',
      cancel: 'रद्द करें',
      close: 'बंद करें',
      delete: 'हटाएं',
      callNow: 'अभी कॉल करें',
      copyNumber: 'नंबर कॉपी करें',
    },
    sidebar: {
      feed: 'कम्युनिटी फीड',
      report: 'समस्या दर्ज करें',
      myReports: 'मेरी रिपोर्ट्स',
      helplines: 'हेल्पलाइन्स',
      notifications: 'सूचनाएं',
      leaderboard: 'लीडरबोर्ड',
      settings: 'सेटिंग्स',
      lightMode: 'लाइट मोड',
      darkMode: 'डार्क मोड',
      logout: 'लॉगआउट',
    },
    leaderboard: {
      pulse: 'नागरिक चैंपियंस',
      title: 'शीर्ष योगदानकर्ता लीडरबोर्ड',
      subtitle: 'सबसे अधिक रिपोर्ट और नागरिक प्रभाव वाले उपयोगकर्ता।',
      rank: 'रैंक',
      reports: 'रिपोर्ट्स',
      resolved: 'समाधान',
      topTen: 'रैंकिंग 4 - 10',
    },
  },
  mr: {
    login: {
      signIn: 'साइन इन',
      enterMobile: 'सुरू करण्यासाठी तुमचा मोबाईल क्रमांक टाका.',
      mobileNumber: 'मोबाईल क्रमांक',
      continue: 'पुढे जा',
      sending: 'पाठवत आहे...',
      termsPrefix: 'पुढे जाऊन तुम्ही आमच्या',
      terms: 'सेवेच्या अटींना',
      officialPrompt: 'तुम्ही शासकीय अधिकारी आहात का?',
      adminPortal: 'अॅडमिन पोर्टल उघडा',
      back: 'मागे',
      verifyOtp: 'OTP पडताळा',
      enterOtpFor: 'यासाठी कोणताही 6-अंकी कोड टाका',
      verifyContinue: 'पडताळा आणि पुढे जा',
      verifying: 'पडताळत आहे...',
      resendIn: 'पुन्हा पाठवा',
      resendOtp: 'OTP पुन्हा पाठवा',
      whatsYourName: 'तुमचे नाव काय आहे?',
      nameHelp: 'हे कम्युनिटी फीडमधील तुमच्या पोस्टवर दिसेल.',
      yourName: 'तुमचे नाव',
      letsGo: 'चला सुरू करूया',
      saving: 'सेव्ह करत आहे...',
      errors: {
        invalidPhone: 'कृपया योग्य 10-अंकी क्रमांक टाका',
        sendOtpFailed: 'OTP पाठवण्यात अयशस्वी',
        incompleteOtp: 'कृपया पूर्ण 6-अंकी OTP टाका',
        generic: 'काहीतरी चूक झाली',
        enterName: 'कृपया तुमचे नाव टाका',
        saveNameFailed: 'नाव सेव्ह करण्यात अयशस्वी',
      },
    },
    settings: {
      title: 'सेटिंग्ज',
      general: 'सामान्य',
      language: 'भाषा',
      change: 'बदला',
      languageSet: 'भाषा सेट झाली',
    },
    common: {
      loading: 'लोड होत आहे...',
      share: 'शेअर',
      save: 'सेव्ह',
      cancel: 'रद्द करा',
      close: 'बंद करा',
      delete: 'हटवा',
      callNow: 'आत्ता कॉल करा',
      copyNumber: 'क्रमांक कॉपी करा',
    },
    sidebar: {
      feed: 'समुदाय फीड',
      report: 'समस्या नोंदवा',
      myReports: 'माझे अहवाल',
      helplines: 'हेल्पलाइन',
      notifications: 'सूचना',
      leaderboard: 'लीडरबोर्ड',
      settings: 'सेटिंग्ज',
      lightMode: 'लाईट मोड',
      darkMode: 'डार्क मोड',
      logout: 'लॉगआउट',
    },
    leaderboard: {
      pulse: 'नागरिक चॅम्पियन्स',
      title: 'टॉप योगदानकर्ते लीडरबोर्ड',
      subtitle: 'सर्वाधिक समस्या नोंदवणारे आणि परिणाम करणारे वापरकर्ते.',
      rank: 'क्रमांक',
      reports: 'अहवाल',
      resolved: 'निकाली',
      topTen: 'क्रमवारी 4 - 10',
    },
    feed: {
      searchPlaceholder: 'शीर्षक, वर्णन किंवा ठिकाणानुसार शोधा...',
      pulse: 'समुदाय स्पंदन',
      trending: 'ट्रेंडिंग समस्या',
      noIssues: 'समस्या सापडल्या नाहीत',
      tryFilter: 'फिल्टर किंवा शोध बदला',
      reportIssue: 'समस्या नोंदवा',
      supporters: 'समर्थक',
      supported: 'समर्थित',
      supportIssue: 'समर्थन द्या',
    },
    report: {
      title: 'समस्या नोंदवा',
      category: 'वर्ग',
      issueTitle: 'समस्येचे शीर्षक',
      issueTitlePlaceholder: 'समस्येचे थोडक्यात शीर्षक',
      description: 'वर्णन',
      descriptionPlaceholder: 'समस्येचे सविस्तर वर्णन...',
      location: 'ठिकाण',
      useMyLocation: 'माझे ठिकाण वापरा',
      hideMap: 'नकाशा लपवा',
      pickOnMap: 'नकाशावर निवडा',
      detectingAddress: 'पत्ता शोधत आहे...',
      searchAddress: 'पत्ता शोधा किंवा टाइप करा...',
      preciseLocation: 'अचूक ठिकाण',
      detecting: 'शोधत आहे...',
      tapMapToPin: 'पिन ठेवण्यासाठी नकाशावर टॅप करा',
      clickMapHelp: 'पिन ठेवण्यासाठी नकाशावर कुठेही क्लिक करा',
      photo: 'फोटो',
      required: '(आवश्यक)',
      clickUpload: 'फोटो अपलोड करण्यासाठी क्लिक करा',
      photoHelp: 'फोटोमुळे समस्या पडताळणी आणि प्राधान्याला मदत होते',
      submitting: 'सबमिट होत आहे...',
      submit: 'अहवाल सबमिट करा',
      errors: {
        titleRequired: 'शीर्षक आवश्यक आहे',
        descriptionRequired: 'वर्णन आवश्यक आहे',
        categoryRequired: 'वर्ग निवडा',
        locationRequired: 'ठिकाण आवश्यक आहे',
        photoRequired: 'फोटो आवश्यक आहे',
        submitFailed: 'सबमिट करण्यात अयशस्वी. पुन्हा प्रयत्न करा.',
      },
    },
    myReports: {
      title: 'माझे अहवाल',
      submitted: 'सबमिट केले',
      newReport: 'नवीन अहवाल',
      noReports: 'अजून अहवाल नाहीत',
      noStatusReports: '{{status}} अहवाल नाहीत',
      issuesAppearHere: 'तुम्ही नोंदवलेल्या समस्या येथे दिसतील',
      tryDifferentFilter: 'दुसरा फिल्टर वापरून पहा',
      reportIssue: 'समस्या नोंदवा',
      share: 'शेअर',
      deleteReport: 'हा अहवाल हटवायचा?',
      deleteHelp: 'ही कृती पूर्ववत करता येणार नाही. अहवाल कायमचा हटवला जाईल.',
      deleted: 'अहवाल हटवला',
      copied: 'अहवाल लिंक कॉपी झाली!',
    },
    issueCard: {
      moreOptions: 'अधिक पर्याय',
      viewDetails: 'तपशील पाहा',
      copyLocation: 'ठिकाण कॉपी करा',
      sharePost: 'पोस्ट शेअर करा',
      issue: 'समस्या',
      issueCopied: 'समस्येचे तपशील कॉपी झाले',
      locationCopied: 'ठिकाण कॉपी झाले',
    },
    issueDetail: {
      notSelected: 'समस्या निवडलेली नाही',
      selectFromFeed: 'तपशील पाहण्यासाठी कम्युनिटी फीडमधून पोस्ट निवडा.',
      backToFeed: 'फीडकडे परत',
      reported: 'नोंदवले',
      viewImage: 'प्रतिमा पहा',
      detailedDescription: 'सविस्तर वर्णन',
      reportedBy: 'नोंदवणारा',
      supporters: 'समर्थक',
      discussion: 'चर्चा',
      citizens: 'नागरिक',
      comments: 'टिप्पण्या',
      prioritySignal: 'समुदाय प्राधान्य संकेत',
      priorityHelp: 'जास्त समर्थनामुळे ही नोंद फीडमध्ये वर दिसते आणि अधिक जलद प्रतिसाद मिळतो.',
      area: 'क्षेत्र',
      priority: 'प्राधान्य',
      high: 'उच्च',
      rising: 'वाढते',
      normal: 'सामान्य',
      impactSupport: 'प्रभाव आणि समुदाय समर्थन',
      impactHelp: 'शेजाऱ्यांची तातडी दाखवण्यासाठी या समस्येला समर्थन द्या.',
      supportThis: 'या समस्येला समर्थन द्या',
      communityReach: 'समुदाय पोहोच',
      views: 'दृश्ये',
      momentum: 'गती',
      strong: 'मजबूत',
      growing: 'वाढत आहे',
      communityDiscussion: 'समुदाय चर्चा',
      addCommentPlaceholder: 'अपडेट द्या किंवा प्रश्न विचारा...',
      postComment: 'टिप्पणी पोस्ट करा',
      noComments: 'अजून टिप्पण्या नाहीत. चर्चा सुरू करा.',
      reply: 'उत्तर द्या',
      replyTo: '{{user}} ला उत्तर...',
      post: 'पोस्ट',
      closeImage: 'प्रतिमा बंद करा',
      expandMap: 'नकाशा मोठा करा',
      issueCopied: 'समस्येचे तपशील कॉपी झाले',
      commentPosted: 'टिप्पणी पोस्ट झाली',
      replyPosted: 'उत्तर पोस्ट झाले',
    },
    notifications: {
      title: 'सूचना',
      unread: 'न वाचलेले',
      markAllRead: 'सर्व वाचले म्हणून चिन्हांकित करा',
      allCaughtUp: 'सगळे अपडेट आहे!',
      noNow: 'आत्ता {{prefix}}सूचना नाहीत',
      navigating: 'समस्येकडे जात आहे...',
      markAsRead: 'वाचले म्हणून चिन्हांकित करा',
      dismiss: 'काढून टाका',
    },
    comments: {
      title: 'टिप्पण्या',
      noCommentsYet: 'अजून टिप्पण्या नाहीत. पहिली टिप्पणी करा!',
      addComment: 'टिप्पणी जोडा...',
    },
    helplines: {
      quickAccess: 'त्वरित प्रवेश',
      title: 'हेल्पलाइन',
      subtitle: 'आपत्कालीन क्रमांक आणि नागरी सेवा संपर्क - लगेच कॉल करा.',
      emergencyNumbers: 'आपत्कालीन क्रमांक',
      searchPlaceholder: 'हेल्पलाइन किंवा सेवा शोधा...',
      municipalServices: 'महानगरपालिका सेवा',
      noFound: '"{{search}}" साठी हेल्पलाइन सापडली नाही',
      contacts: 'संपर्क',
      contact: 'संपर्क',
      proTip: 'उपयुक्त सूचना',
      tipText: 'आधी अॅपमध्ये समस्या नोंदवा, नंतर रिपोर्ट आयडीसह संबंधित हेल्पलाइनला कॉल करा. यामुळे अधिकृत नोंद तयार होते.',
    },
  },
};

const LanguageContext = createContext(null);

function getByPath(obj, path) {
  return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
}

export function LanguageProvider({ children }) {
  const initialLanguage = localStorage.getItem(STORAGE_KEY) || 'en';
  const [language, setLanguageState] = useState(initialLanguage);

  const setLanguage = (nextLanguage) => {
    if (!LANGUAGE_OPTIONS.some(({ code }) => code === nextLanguage)) return;
    localStorage.setItem(STORAGE_KEY, nextLanguage);
    setLanguageState(nextLanguage);
  };

  const t = (key) => {
    const current = getByPath(translations[language], key);
    if (current !== undefined) return current;
    const fallback = getByPath(translations.en, key);
    return fallback !== undefined ? fallback : key;
  };

  const interpolate = (template, vars = {}) => {
    if (typeof template !== 'string') return template;
    return template.replace(/\{\{(.*?)\}\}/g, (_, token) => vars[token.trim()] ?? '');
  };

  const tf = (key, vars = {}) => interpolate(t(key), vars);

  const categoryLabel = (categoryId) => {
    const item = CATEGORY_LABELS[categoryId];
    if (!item) return categoryId;
    return item[language] || item.en;
  };

  const statusLabel = (status) => {
    const item = STATUS_LABELS[status];
    if (!item) return status;
    return item[language] || item.en;
  };

  const formatTimeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) {
      if (language === 'mr') return `${mins} मि. पूर्वी`;
      if (language === 'hi') return `${mins} मिनट पहले`;
      return `${mins}m ago`;
    }
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) {
      if (language === 'mr') return `${hrs} ता. पूर्वी`;
      if (language === 'hi') return `${hrs} घंटे पहले`;
      return `${hrs}h ago`;
    }
    const days = Math.floor(hrs / 24);
    if (days < 30) {
      if (language === 'mr') return `${days} दिवसांपूर्वी`;
      if (language === 'hi') return `${days} दिन पहले`;
      return `${days}d ago`;
    }
    const months = Math.floor(days / 30);
    if (language === 'mr') return `${months} महिन्यांपूर्वी`;
    if (language === 'hi') return `${months} महीने पहले`;
    return `${months}mo ago`;
  };

  const value = useMemo(() => ({
    language,
    setLanguage,
    languageOptions: LANGUAGE_OPTIONS,
    t,
    tf,
    categoryLabel,
    statusLabel,
    formatTimeAgo,
  }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};
