import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import BreadcrumbNav from "../../components/AboutUsDisplay/BreadcrumbNav";
import ContentSection from "../../components/AboutUsDisplay/ContentSection";
import TestimonialCard from "../../components/AboutUsDisplay/TestimonialCard";

const AboutUs = () => {
  return (
    <main className="pb-5">
      <BreadcrumbNav />

      <ContentSection
        isDark={true}
        title="A Family That Keeps On Growing"
        description="We always aim to please the home market, supplying great computers and hardware at great prices to non-corporate customers, through our large Melbourne CBD showroom and our online store.

Shop management approach fosters a strong customer service focus in our staff. We prefer to cultivate long-term client relationships rather than achieve quick sales, demonstrated in the measure of our long-term success."
        imageSrc="https://cdn.builder.io/api/v1/image/assets/TEMP/9d4fe751e2ad15ae258229f22d5a0ec3ebb44adac2c68155fa6f3d2c561efa9f?placeholderIfAbsent=true&apiKey=52b7549cc4dc41b1b490a6ca3e3b5e4d"
      />

      <ContentSection
        isDark={false}
        title="Shop.com"
        description="Shop.com is a proudly Australian owned, Melbourne based supplier of I.T. goods and services, operating since 1991. Our client base encompasses individuals, small business, corporate and government organisations. We provide complete business IT solutions, centred on high quality hardware and exceptional customer service."
        imageSrc="https://cdn.builder.io/api/v1/image/assets/TEMP/d0844c3f86704e48ea9bc040ce701c4cf5aa85326f2bb6f02720e5a389465c92?placeholderIfAbsent=true&apiKey=52b7549cc4dc41b1b490a6ca3e3b5e4d"
        imageFirst={true}
        showSquare={true}
      />

      <ContentSection
        isDark={true}
        title="Now You're In Safe Hands"
        description="Experience a 40% boost in computing from last generation. MSI Desktop equips the 10th Gen. Intel® Core™ i7 processor with the upmost computing power to bring you an unparalleled gaming experience.

*Performance compared to i7-9700. Specs varies by model."
        imageSrc="https://cdn.builder.io/api/v1/image/assets/TEMP/1d801081cf8af47115c3cac9e75c5c47a0058398bc800262fc179949f70565b7?placeholderIfAbsent=true&apiKey=52b7549cc4dc41b1b490a6ca3e3b5e4d"
      />

      <ContentSection
        isDark={false}
        title="The Highest Quality of Products"
        description="We guarantee the highest quality of the products we sell. Several decades of successful operation and millions of happy customers let us feel certain about that. Besides, all items we sell pass thorough quality control, so no characteristics mismatch can escape the eye of our professionals."
        imageSrc="https://cdn.builder.io/api/v1/image/assets/TEMP/f22e71861b2104c426adc78c99786e5c5db308d610afe781399775d61e68b3d0?placeholderIfAbsent=true&apiKey=52b7549cc4dc41b1b490a6ca3e3b5e4d"
        imageFirst={true}
      />

      <ContentSection
        isDark={true}
        title="We Deliver to Any Regions"
        description="We deliver our goods all across Australia. No matter where you live, your order will be shipped in time and delivered right to your door or to any other location you have stated. The packages are handled with utmost care, so the ordered products will be handed to you safe and sound, just like you expect them to be."
        imageSrc="https://cdn.builder.io/api/v1/image/assets/TEMP/a3f307397ee3738e23d1855e31ba1cb1a527de8c39482200799c28f4a8416f27?placeholderIfAbsent=true&apiKey=52b7549cc4dc41b1b490a6ca3e3b5e4d"
      />

      <TestimonialCard />
    </main>
  );
};

export default AboutUs;
