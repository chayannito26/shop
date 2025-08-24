const bn = {
  lang: { english: 'English', bengali: 'বাংলা' },
  prompt: {
    title: 'ভাষা নির্বাচন করুন',
    description: 'আপনার পছন্দের ভাষা নির্বাচন করুন।',
    english: 'English',
    bengali: 'বাংলা',
  },
  header: {
    title: 'ছায়ান্বিত ২৬',
    subtitle: 'মার্চেন্ডাইজ স্টোর',
    nav: { home: 'হোম', cart: 'ঝুড়ি' },
    switch: { toEnglish: 'English Langauge', toBengali: 'বাংলা ভাষা' },
  },
  home: {
    hero: {
      title: 'ছায়ান্বিত ২৬',
      subtitle: 'অফিসিয়াল মার্চেন্ডাইজ স্টোর',
      tagline:
        'আপনার ব্যাচের জন্যে গর্ব প্রকাশ করুন! ছায়ান্বিত ২৬ এর জন্য উচ্চমানের মার্চেন্ডাইজ।',
    },
    sections: {
      products: {
        title: 'আমাদের পণ্যসমূহ',
        subtitle:
          'শুধুমাত্র ছায়ান্বিত ২৬ এর জন্য ডিজাইনকৃত প্রিমিয়াম পণ্যসমূহ আবিষ্কার করুন',
      },
    },
    filter: {
      all: 'সব',
      noneFound: 'নির্বাচিত ক্যাটাগরিতে কোনো পণ্য পাওয়া যায়নি।',
      clear: 'ফিল্টার পরিষ্কার করুন',
    },
  },
  product: {
    back: 'পণ্যের তালিকায় ফিরে যান',
    phoneModel: {
      label: 'ফোন মডেল:',
      placeholder: 'যেমন: iPhone 12, Samsung Galaxy S24',
      help: 'সঠিক ফিটের জন্য সঠিক মডেল লিখুন।',
    },
    sizeLabel: 'সাইজ',
    optionsLabel: 'অপশন',
    quantity: 'পরিমাণ:',
    buyNow: 'সরাসরি কিনুন',
    addToCart: 'ঝুড়িতে যোগ করুন',
    notFound: 'পণ্য পাওয়া যায়নি',
    returnHome: 'হোমে ফিরে যান',
    addedToCart: 'পণ্য সফলভাবে ঝুড়িতে যোগ হয়েছে!',
    validation: {
      selectVariation: 'দয়া করে সাইজ/ভ্যারিয়েশন নির্বাচন করুন',
      enterPhoneModel: 'দয়া করে আপনার ফোনের মডেল লিখুন (যেমন: iPhone 12, Samsung Galaxy S24)',
    },
  },
  cart: {
    title: 'শপিং ঝুড়ি',
    empty: {
      title: 'আপনার ঝুড়ি খালি',
      subtitle: 'ছায়ান্বিত ২৬ এর দারুণ পণ্যগুলো যোগ করুন!',
      continue: 'কেনাকাটা চালিয়ে যান',
    },
    summary: {
      title: 'অর্ডার সারাংশ',
      subtotal: 'সাবটোটাল',
      discount: 'ডিসকাউন্ট',
      total: 'মোট',
      checkout: 'চেকআউটে যান',
      continue: 'কেনাকাটা চালিয়ে যান',
    },
    variation: { model: 'মডেল', size: 'সাইজ', option: 'অপশন' },
  },
  checkout: {
    title: 'চেকআউট',
    form: {
      title: 'অর্ডার তথ্য',
      name: 'পূর্ণ নাম *',
      roll: 'রোল নম্বর *',
      department: 'বিভাগ *',
      selectDepartment: 'বিভাগ নির্বাচন করুন',
      dept: { science: 'বিজ্ঞান', arts: 'মানবিক', commerce: 'বাণিজ্য' },
      phone: 'ফোন নম্বর *',
      email: 'ইমেইল (না দিলেও চলবে)',
    },
    payment: {
      title: 'বিকাশে টাকা কিভাবে পাঠাবেনঃ',
      step1: 'ধাপ ১:',
      step1Text: 'Send money করুন এই নাম্বারে: {number}',
      step2: 'ধাপ ২:',
      step2Text: 'এত টাকা পাঠাবেনঃ ৳{amount}',
      step3: 'ধাপ ৩:',
      step3Text:
        'বিকাশ থেকে ট্রানজ্যাকশন আইডি কপি করে নিচে পেস্ট করুন',
      step4: 'ধাপ ৪:',
      step4Text: 'উপরের ফর্মটি পূরণ করুন',
    },
    bkash: {
      label: 'বিকাশ ট্রানজ্যাকশন আইডি *',
      placeholder: 'যেমন: BH12345678',
      help: 'সাবমিট করার আগে ট্রানজ্যাকশন আইডি সঠিক কিনা যাচাই করুন',
    },
    placeOrder: 'অর্ডার করুন',
    placingOrder: 'অর্ডার হচ্ছে...',
    placed: {
      title: 'অর্ডার সফলভাবে সম্পন্ন হয়েছে!',
      instruction:
        'আপনার অর্ডার গ্রহণ করা হয়েছে এবং শীঘ্রই প্রসেস করা হবে। ভবিষ্যতে রেফারেন্সের জন্য অর্ডার আইডির স্ক্রিনশট রাখুন।',
      orderId: 'অর্ডার আইডি',
      continue: 'কেনাকাটা চালিয়ে যান',
      viewCart: 'ঝুড়ি দেখুন',
    },
    note: {
      title: 'নোট:',
      text: 'পেমেন্ট যাচাইয়ের পর আপনার অর্ডার প্রসেস করা হবে। ২৪ ঘণ্টার মধ্যে আপনাকে অর্ডার কনফার্মেশন ও ডেলিভারি সম্পর্কে জানানো হবে।',
      express:
        'এক্সপ্রেস অর্ডার: এটি সরাসরি ক্রয় — ঝুড়িের আইটেমগুলো প্রভাবিত হবে না।',
    },
    validation: {
      phoneInvalid: 'ফোন নম্বর সঠিক নয়। ১১ সংখ্যার হতে হবে।',
      bkashInvalid: 'ট্রানজ্যাকশন আইডি সঠিক নয়। ১০ অক্ষরের হতে হবে।',
    },
  },
  coupon: {
    placeholder: 'কুপন কোড লিখুন',
    apply: 'কুপন প্রয়োগ করুন',
    removeTitle: 'কুপন সরান',
    expiresIn: 'কুপনের মেয়াদ শেষ হবে {time} পর',
    errors: {
      enterCode: 'দয়া করে একটি কুপন কোড লিখুন।',
      invalid: 'কুপন কোড সঠিক নয়।',
      notActive: 'এই কুপন আর সক্রিয় নেই।',
      expired: 'এই কুপনের মেয়াদ শেষ হয়েছে।',
      usageLimit: 'এই কুপনের ব্যবহারসীমা পূর্ণ হয়েছে। এটি আর ব্যবহার করা যাবে না।',
      minOrder: 'এই কুপনের জন্য ন্যূনতম অর্ডার হতে হবে ৳{min} টাকার।',
      fetchError: 'কুপন সঠিক কিনা যাচাই করা যায়নি। কিছুক্ষণ পরে আবার চেষ্টা করুন।',
    },
    success: { applied: 'কুপন সফলভাবে প্রয়োগ হয়েছে!' },
  },
  catalog: {
    categories: {
      clothing: 'পোশাক',
      accessories: 'অ্যাক্সেসরিজ',
      phone: 'ফোন অ্যাক্সেসরিজ',
    },
    products: {
      phonecover: {
        name: 'কাস্টম ফোন কভার',
        description: 'কাস্টম-প্রিন্টেড ব্যাক কভার। সঠিক ফিটের জন্য ফোনের নির্দিষ্ট মডেল দিন।',
      },
    },
  },
};

export default bn;
