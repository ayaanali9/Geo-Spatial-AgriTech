import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const articles = [
  {
    id: 1,
    title: "What is NDVI and Why Does It Matter for Farmers?",
    titleHi: "NDVI क्या है और किसानों के लिए यह क्यों ज़रूरी है?",
    content: `NDVI stands for Normalized Difference Vegetation Index. It is a numerical indicator that uses the visible red and near-infrared bands of the electromagnetic spectrum to analyze whether an area contains live green vegetation or not. Healthy plants absorb most of the visible red light and reflect a large portion of the near-infrared light. In contrast, unhealthy or sparse vegetation reflects more visible light and less near-infrared light. The NDVI value ranges from -1.0 to +1.0 — values close to +1 indicate dense, healthy vegetation, while values near 0 suggest barren soil or dead crops. For Indian farmers, this means they can now get a scientific health check of their fields without physically walking through every acre. A single satellite scan can reveal which parts of the field need water, fertilizer, or pest treatment.`,
    contentHi: `NDVI का पूरा नाम है नॉर्मलाइज़्ड डिफरेंस वेजिटेशन इंडेक्स। यह एक संख्यात्मक सूचकांक है जो विद्युतचुम्बकीय स्पेक्ट्रम की दृश्य लाल और निकट-अवरक्त किरणों का उपयोग करके विश्लेषण करता है कि किसी क्षेत्र में जीवित हरी वनस्पति है या नहीं। स्वस्थ पौधे अधिकांश दृश्य लाल रोशनी को सोख लेते हैं और निकट-अवरक्त रोशनी का बड़ा हिस्सा परावर्तित करते हैं। इसके विपरीत, अस्वस्थ या विरल वनस्पति अधिक दृश्य रोशनी परावर्तित करती है और कम निकट-अवरक्त रोशनी। NDVI का मान -1.0 से +1.0 के बीच होता है — +1 के करीब मान घनी, स्वस्थ वनस्पति दर्शाता है, जबकि 0 के करीब मान बंजर मिट्टी या सूखी फसल का संकेत देता है। भारतीय किसानों के लिए इसका अर्थ है कि अब वे बिना हर एकड़ में पैदल घूमे अपने खेतों की वैज्ञानिक स्वास्थ्य जाँच करवा सकते हैं। एक ही सैटेलाइट स्कैन बता सकता है कि खेत के किस हिस्से में पानी, खाद या कीटनाशक की ज़रूरत है।`,
    emoji: "🌱",
    date: "April 2026"
  },
  {
    id: 5,
    title: "The 'Pond Bug' and How We Fixed It with MNDWI",
    titleHi: "तालाब की काई और MNDWI का जादुई फिक्स",
    content: `While testing the app in my village, I ran into a really funny but serious issue. The AI told me to add fertilizer to a local pond! It turns out, the satellite's NDVI sensor gets confused by the green algae floating on the water and thinks it's a healthy crop. If we are going to rely on this data for real farming, it has to be 100% accurate. So, I dug deeper into remote sensing research and implemented something called MNDWI (Modified Normalized Difference Water Index). It uses infrared bands to easily spot water bodies. Now, our system is smart enough to know the difference between a green field and a green pond, making the crop advice completely reliable.`,
    contentHi: `अपने गाँव में इस ऐप को टेस्ट करते समय मुझे एक बड़ी मज़ेदार लेकिन ज़रूरी दिक्कत मिली। हमारा AI मुझे गाँव के एक तालाब में यूरिया डालने की सलाह दे रहा था! हुआ ये कि पानी के ऊपर जमी हरी काई को सैटेलाइट का NDVI सेंसर हरी फसल समझ बैठा था। किसानों के लिए यह डेटा बिल्कुल सटीक होना चाहिए, इसलिए मैंने रिसर्च करके इसमें MNDWI तकनीक जोड़ दी। यह इन्फ्रारेड किरणों का इस्तेमाल करके पानी को तुरंत पहचान लेती है। अब हमारा AI इतना समझदार है कि वो हरे खेत और हरे तालाब के बीच का फर्क आसानी से पकड़ लेता है, जिससे किसानों को एकदम सही जानकारी मिलती है।`,
    emoji: "💧",
    date: "August 2026"
  },
  {
    id: 2,
    title: "Sentinel-2: The Satellite That Watches Over Indian Fields",
    titleHi: "सेंटिनल-2: वह उपग्रह जो भारतीय खेतों की निगरानी करता है",
    content: `Sentinel-2 is a pair of Earth observation satellites developed by the European Space Agency (ESA) as part of the Copernicus Programme. These satellites orbit the Earth and capture high-resolution multispectral images every 5 days, covering 13 spectral bands at resolutions up to 10 meters. This means every patch of farmland in India gets a fresh photograph from space roughly once a week. The data is completely free and open to the public. For our platform, we specifically use Band 4 (Red) and Band 8 (Near-Infrared) to compute NDVI. We also filter images with more than 20-30% cloud cover, ensuring that the analysis is based on clear, usable imagery. This satellite data forms the backbone of our crop health analysis — what once required expensive drones or manual surveys can now be done from a phone screen using freely available space technology.`,
    contentHi: `सेंटिनल-2 यूरोपीय अंतरिक्ष एजेंसी (ESA) द्वारा कोपर्निकस कार्यक्रम के तहत विकसित पृथ्वी अवलोकन उपग्रहों की एक जोड़ी है। ये उपग्रह पृथ्वी की परिक्रमा करते हैं और हर 5 दिनों में उच्च-रिज़ॉल्यूशन मल्टीस्पेक्ट्रल तस्वीरें लेते हैं, जो 10 मीटर तक की रिज़ॉल्यूशन पर 13 स्पेक्ट्रल बैंड को कवर करती हैं। इसका मतलब है कि भारत में खेती की हर ज़मीन की अंतरिक्ष से लगभग हर हफ़्ते एक ताज़ा तस्वीर मिलती है। यह डेटा पूरी तरह मुफ़्त और सार्वजनिक रूप से उपलब्ध है। हमारे प्लेटफ़ॉर्म में हम विशेष रूप से बैंड 4 (लाल) और बैंड 8 (निकट-अवरक्त) का उपयोग करके NDVI की गणना करते हैं। हम 20-30% से अधिक बादल वाली तस्वीरों को भी फ़िल्टर करते हैं, जिससे विश्लेषण साफ़ और उपयोगी तस्वीरों पर आधारित हो। यह उपग्रह डेटा हमारे फसल स्वास्थ्य विश्लेषण की रीढ़ है — जिस काम के लिए पहले महँगे ड्रोन या मैन्युअल सर्वे की ज़रूरत होती थी, वह अब फ़ोन की स्क्रीन से मुफ़्त अंतरिक्ष तकनीक के ज़रिये हो सकता है।`,
    emoji: "🛰️",
    date: "April 2026"
  },
  {
    id: 3,
    title: "AI in Agriculture: From Data to Actionable Advice",
    titleHi: "कृषि में AI: डेटा से व्यावहारिक सलाह तक",
    content: `Artificial Intelligence in agriculture is not about replacing farmers — it is about giving them better tools to make decisions. In our system, once the NDVI score is calculated from the satellite image, an AI classification engine takes over. It compares the score against thresholds that have been calibrated specifically for the soil types and crop patterns found in western Uttar Pradesh. A score below 0.2 indicates barren or waterlogged land. Between 0.2 and 0.4 suggests the field has been harvested or a newly sown crop is too young to detect. Scores between 0.4 and 0.65 indicate moderate health where irrigation or fertilizer intervention may help. Above 0.65 means the crop is thriving. These thresholds are not universal — they are tuned for local conditions, which is what makes the advice relevant and actionable for farmers in this specific region.`,
    contentHi: `कृषि में कृत्रिम बुद्धिमत्ता (AI) का उद्देश्य किसानों की जगह लेना नहीं है — बल्कि उन्हें निर्णय लेने के लिए बेहतर उपकरण देना है। हमारी प्रणाली में, जब सैटेलाइट तस्वीर से NDVI स्कोर की गणना हो जाती है, तो एक AI वर्गीकरण इंजन काम शुरू करता है। यह स्कोर की तुलना उन सीमाओं से करता है जो विशेष रूप से पश्चिमी उत्तर प्रदेश की मिट्टी के प्रकारों और फसल पैटर्न के लिए तैयार की गई हैं। 0.2 से कम स्कोर बंजर या जलभराव वाली ज़मीन दर्शाता है। 0.2 से 0.4 के बीच यह बताता है कि खेत की फसल कट चुकी है या नई बोई गई फसल अभी बहुत छोटी है। 0.4 से 0.65 के बीच के स्कोर मध्यम स्वास्थ्य दर्शाते हैं, जहाँ सिंचाई या उर्वरक से सुधार हो सकता है। 0.65 से ऊपर का मतलब है कि फसल बहुत अच्छी स्थिति में है। ये सीमाएँ सार्वभौमिक नहीं हैं — ये स्थानीय परिस्थितियों के अनुसार तैयार की गई हैं, जो इस क्षेत्र के किसानों के लिए सलाह को प्रासंगिक और व्यावहारिक बनाती हैं।`,
    emoji: "🤖",
    date: "May 2026"
  },
  {
    id: 4,
    title: "The Future of Space Technology in Indian Farming",
    titleHi: "भारतीय खेती में अंतरिक्ष तकनीक का भविष्य",
    content: `India is one of the largest agricultural economies in the world, yet most small and marginal farmers still rely on traditional methods to assess crop health. Space technology is changing this. With free satellite data from programs like Copernicus and ISRO's own remote sensing missions, it is now possible to build affordable monitoring tools that work at the village level. In the coming years, we can expect higher resolution satellites (under 1 meter), real-time weather integration, soil moisture mapping, and predictive models that warn farmers about droughts or pest attacks weeks in advance. Kisan Space Tech is a step in this direction — proving that a combination of satellite data, cloud computing, and simple web interfaces can put powerful agricultural intelligence in the hands of every farmer, regardless of their technical background.`,
    contentHi: `भारत दुनिया की सबसे बड़ी कृषि अर्थव्यवस्थाओं में से एक है, फिर भी अधिकांश छोटे और सीमांत किसान अभी भी फसल की सेहत जाँचने के लिए पारंपरिक तरीकों पर निर्भर हैं। अंतरिक्ष तकनीक इसे बदल रही है। कोपर्निकस और इसरो के अपने रिमोट सेंसिंग मिशनों जैसे कार्यक्रमों से मुफ़्त उपग्रह डेटा के साथ, अब गाँव स्तर पर काम करने वाले किफ़ायती निगरानी उपकरण बनाना संभव है। आने वाले वर्षों में, हम उच्च रिज़ॉल्यूशन उपग्रहों (1 मीटर से कम), वास्तविक समय मौसम एकीकरण, मिट्टी की नमी मानचित्रण, और पूर्वानुमान मॉडल की उम्मीद कर सकते हैं जो किसानों को सूखे या कीट हमलों के बारे में हफ़्तों पहले चेतावनी दें। किसान स्पेस टेक इसी दिशा में एक कदम है — यह साबित करता है कि उपग्रह डेटा, क्लाउड कंप्यूटिंग, और सरल वेब इंटरफ़ेस का संयोजन हर किसान के हाथों में शक्तिशाली कृषि बुद्धिमत्ता दे सकता है, चाहे उनकी तकनीकी पृष्ठभूमि कुछ भी हो।`,
    emoji: "🚀",
    date: "May 2026"
  }
];

function Blog() {
  return (
    <>
      <Navbar />

      <section className="page-hero">
        <h1 className="page-hero-title">Blog</h1>
        <p className="page-hero-subtitle">Articles on satellite technology, NDVI, and precision agriculture</p>
      </section>

      <section className="page-content">
        {articles.map((article) => (
          <article className="content-card blog-article" key={article.id}>
            <div className="article-header">
              <span className="article-emoji">{article.emoji}</span>
              <span className="article-date">{article.date}</span>
            </div>

            <h2>{article.title}</h2>
            <div className="dual-lang">
              <div className="lang-block">
                <span className="lang-tag">English</span>
                <p>{article.content}</p>
              </div>
              <div className="lang-block">
                <span className="lang-tag">हिंदी</span>
                <p>{article.contentHi}</p>
              </div>
            </div>

            <h3 className="hindi-title">{article.titleHi}</h3>
          </article>
        ))}
      </section>

      <Footer />
    </>
  );
}

export default Blog;
