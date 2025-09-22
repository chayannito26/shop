const en = {
  lang: { english: 'English', bengali: 'Bengali' },
  prompt: {
    title: 'Choose your language',
    description: 'Please select your preferred language.',
    english: 'English',
    bengali: 'বাংলা',
  },
  header: {
    title: 'Chayannito 26',
    subtitle: 'Merchandise Store',
    nav: { home: 'Home', cart: 'Cart' },
    switch: { toEnglish: 'English', toBengali: 'বাংলা ভাষা' },
  },
  home: {
    hero: {
      title: 'Chayannito 26',
      subtitle: 'Official Merchandise Store',
      tagline: 'Represent your batch with pride! High-quality merchandise designed for Chayannito 26.',
    },
    sections: {
      products: {
        title: 'Our Products',
        subtitle:
          'Discover our collection of premium merchandise designed exclusively for Chayannito 26',
      },
    },
    filter: {
      all: 'All',
      noneFound: 'No products found for the selected category.',
      clear: 'Clear Filter',
    },
  },
  product: {
    back: 'Back to Products',
    phoneModel: {
      label: 'Phone Model:',
      placeholder: 'e.g., iPhone 12, Samsung Galaxy A12',
      help: 'Please provide exact model for a proper fit.',
    },
    sizeLabel: 'Size',
    optionsLabel: 'Options',
    quantity: 'Quantity:',
    buyNow: 'Buy Now',
    addToCart: 'Add to Cart',
    notFound: 'Product Not Found',
    returnHome: 'Return to Home',
    addedToCart: 'Product added to cart successfully!',
    validation: {
      selectVariation: 'Please select a size/variation',
      enterPhoneModel: 'Please enter your phone model (e.g., iPhone 12, Samsung A12)',
    },
    noMoney: {
      title: 'Need a discount?',
      button: 'No money',
      message:
        "No money?।\n\nIf you're short on budget, we can help — contact us to request a price-reduction coupon or tips to save money on your order. Some items include discountable markup. Please reach out and we'll check if we can offer a coupon for {name}. Send us a message with the product name and what you need.",
    },
  },
  cart: {
    title: 'Shopping Cart',
    empty: {
      title: 'Your cart is empty',
      subtitle: 'Add some awesome Chayannito 26 merchandise!',
      continue: 'Continue Shopping',
    },
    summary: {
      title: 'Order Summary',
      subtotal: 'Subtotal',
      discount: 'Discount',
      total: 'Total',
      checkout: 'Proceed to Checkout',
      continue: 'Continue Shopping',
    },
    variation: { model: 'Model', size: 'Size', option: 'Option' },
  },
  checkout: {
    title: 'Checkout',
    form: {
      title: 'Order Information',
      name: 'Full Name *',
      roll: 'Roll Number *',
      department: 'Department *',
      selectDepartment: 'Select Department',
      dept: { science: 'Science', arts: 'Arts', commerce: 'Commerce' },
      phone: 'Phone Number *',
      email: 'Email (optional)',
      emailPlaceholder: 'abc@gmail.com',
    },
    payment: {
      title: 'bKash Payment Instructions',
      step1: 'Step 1:',
      step1Text: 'Send money to: {number}',
      step2: 'Step 2:',
      step2Text: 'Amount: ৳{amount}',
      step3: 'Step 3:',
      step3Text: 'Copy the transaction ID from bKash and paste it below',
      step4: 'Step 4:',
      step4Text: 'Complete this form',
    },
    bkash: {
      label: 'bKash Transaction ID *',
      placeholder: 'e.g., BH12345678',
      help: 'Alternatively, upload a screenshot of the bKash success page and we’ll detect the 10‑character transaction ID automatically.',
      ocr: {
        orUpload: 'Or upload a screenshot of the bKash success page',
        uploadBtn: 'Upload Screenshot',
        changeBtn: 'Change Screenshot',
        detecting: 'Detecting transaction ID…',
        progress: 'Processing image… {percent}%',
        found: 'Detected Transaction ID: {id}',
        notFound: 'Couldn’t find a valid 10‑character ID. Please try a clearer screenshot or enter it manually.',
        tip: 'Tip: Crop to the area showing “Transaction ID” for better results.'
      }
    },
    placeOrder: 'Place Order',
    placingOrder: 'Placing Order...',
    placed: {
      title: 'Order Placed Successfully!',
      instruction:
        'Your order has been received and will be processed soon. Take a screenshot of your Order ID for future reference.',
      orderId: 'Order ID',
      continue: 'Continue Shopping',
      viewCart: 'View Cart',
    },
    note: {
      title: 'Note:',
      text: 'Your order will be processed after payment verification. You will be contacted within 24 hours for order confirmation and delivery details.',
      express:
        'Express Order: This is a direct purchase - no cart items will be affected.',
    },
    validation: {
      phoneInvalid:
        'Invalid phone number. Use an 11-digit Bangladeshi number starting with 01 (e.g., 01712345678).',
      bkashInvalid:
        'Invalid bKash Transaction ID. Enter the 10-character alphanumeric ID (e.g., BH12A3B4C5).',
  required: 'Please fill out this field.',
  emailInvalid: 'Please enter a valid email address.',
    },
    error: {
      placeOrder: 'Error placing order. Please try again.',
    },
  },
  coupon: {
    placeholder: 'Enter Coupon Code',
    apply: 'Apply',
    removeTitle: 'Remove Coupon',
    expiresIn: 'Expires in {time}',
    errors: {
      enterCode: 'Please enter a coupon code.',
      invalid: 'Invalid coupon code.',
      notActive: 'This coupon is no longer active.',
      expired: 'This coupon has expired.',
      usageLimit: 'This coupon has reached its usage limit.',
      minOrder: 'This coupon requires a minimum order of ৳{min}.',
      fetchError: 'Could not validate coupon. Please try again.',
    },
    success: { applied: 'Coupon applied successfully!' },
  },
  catalog: {
    categories: {
      clothing: 'Clothing',
      accessories: 'Accessories',
      phone: 'Phone Accessories',
      stationery: 'Stationery',
    },
    products: {
      notebook: {
        name: 'Chayannito 26 Notebook',
        description:
          'Premium notebooks in A4 and A5. A4: 150 or 300 blank pages on 70 gsm paper; A5: 160 pages (blank or lined) on 100 gsm paper. Cover: 300 gsm Ambush card. Note: Page count is double-sided.',
        variationTitles: { size: 'Size', finish: 'Page type', pages: 'Pages' },
      },
      phonecover: {
        name: 'Custom Phone Cover',
        description: 'Custom-printed back cover. Provide your exact phone model.',
      },
    },
  },
  variation: {
    titles: {
      color: 'Color',
      size: 'Size',
      finish: 'Finish',
      pages: 'Pages',
      option: 'Option'
    },
    selected: 'Selected:',
    values: {
      common: {
        color: {
          White: 'White',
          Black: 'Black'
        },
        size: {
          S: 'S',
          M: 'M',
          L: 'L',
          XL: 'XL',
          XS: 'XS',
          XXL: 'XXL'
        },
        finish: {
          Blank: 'Blank',
          Lined: 'Lined'
        }
      },
      products: {
        // product-specific overrides can be added here
        notebook: {
          size: { A4: 'A4', A5: 'A5' },
          finish: { Blank: 'Blank', Lined: 'Lined' },
          pages: { '150': '150 pages', '160': '160 pages', '300': '300 pages' },
        }
      }
    }
  },
};

export default en;
