// ===================================================
// CONFIGURATION
// ===================================================
// To receive form submissions, sign up at https://formspree.io and create a form.
// Paste your Formspree Form ID here (e.g. "xqaapwld"):
const FORMSPREE_FORM_ID = "YOUR_FORMSPREE_FORM_ID";

jQuery(document).ready(function () {

  // 1. Context Passing Engine for Blueprints
  const blueprintTriggers = document.querySelectorAll(".trigger-blueprint-modal");
  const modalContextField = document.getElementById("form-blueprint-context");
  const embedContextField = document.getElementById("form-blueprint-context-embed");

  blueprintTriggers.forEach(element => {
    element.addEventListener("click", (event) => {
      event.preventDefault();
      const capturedType = event.currentTarget.getAttribute("data-blueprint-type");
      
      // Inject parameters safely down into targets
      if (modalContextField) modalContextField.value = capturedType;
      if (embedContextField) embedContextField.value = capturedType;
      
      console.log(`[GrowSure Core] Input context pipeline bound to: ${capturedType}`);
      
      // Fire Fancybox explicitly if it is loaded and bound
      if (typeof jQuery !== "undefined" && typeof jQuery.fancybox !== "undefined") {
        jQuery.fancybox.open({
          src: "#dialog-content-contact",
          type: "inline"
        });
      }
    });
  });

  // Initialize AOS (Animate on Scroll)
  if (typeof AOS !== 'undefined') {
    AOS.init({
      once: true,
      offset: 100,
      duration: 1200
    });
  }

  // Mobile navigation header menu toggle
  jQuery('.site-header__toggler').on('click', function() {
    jQuery(this).toggleClass('active');
    jQuery('#site-navigation').toggleClass('active');
    jQuery('html, body').toggleClass('fixed');
  });

  // Close mobile navigation on link click
  jQuery('#site-navigation a').on('click', function() {
    jQuery('.site-header__toggler').removeClass('active');
    jQuery('#site-navigation').removeClass('active');
    jQuery('html, body').removeClass('fixed');
  });

  // Initialize slick slider for teams list on Careers block / Careers page
  if (jQuery('.teams__list').length && typeof jQuery.fn.slick !== 'undefined') {
    const initSlick = () => {
      if (jQuery(window).width() < 992) {
        if (!jQuery('.teams__list').hasClass('slick-initialized')) {
          jQuery('.teams__list').slick({
            slidesToShow: 2,
            slidesToScroll: 1,
            arrows: false,
            dots: false,
            autoplay: false,
            responsive: [
              {
                breakpoint: 768,
                settings: {
                  centerMode: true,
                  centerPadding: '100px',
                  slidesToShow: 1,
                }
              },
              {
                breakpoint: 480,
                settings: {
                  centerMode: false,
                  slidesToShow: 1,
                }
              },
            ]
          });
        }
      } else {
        if (jQuery('.teams__list').hasClass('slick-initialized')) {
          jQuery('.teams__list').slick('unslick');
        }
      }
    };

    initSlick();
    jQuery(window).on('resize', initSlick);
  }

  // Solutions page technology grid show more toggle
  if (jQuery('.technology__toggle').length) {
    jQuery('.technology__toggle').on('click', function() {
      jQuery('.technology__list').addClass('show');
      jQuery(this).hide();
    });
  }

  // ===================================================
  // MODAL CONTACT FORM HANDLING (Fancybox dialog)
  // ===================================================
  const modalForm = document.getElementById("contactForm");
  if (modalForm) {
    modalForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const fullname = document.getElementById("fullname").value.trim();
      const company = document.getElementById("company").value.trim() || 'Not Provided';
      const email = document.getElementById("email").value.trim();
      const phone = document.getElementById("phone").value.trim() || 'Not Provided';
      const projectType = document.getElementById("project_type").value;
      const details = document.getElementById("message").value.trim();
      const policy = document.getElementById("policy").checked;
      const errorMsg = document.getElementById("errorMsg");

      errorMsg.style.display = "none";
      errorMsg.textContent = "";

      if (!fullname || !email || !projectType || !details || !policy) {
        errorMsg.textContent = "Please fill in all required fields.";
        errorMsg.style.display = "block";
        return;
      }

      // reCAPTCHA validation
      let recaptchaToken = "";
      if (typeof grecaptcha !== 'undefined') {
        recaptchaToken = grecaptcha.getResponse(0); // Fetch first captcha widget
      }

      if (!recaptchaToken) {
        errorMsg.textContent = "Please confirm that you are not a robot.";
        errorMsg.style.display = "block";
        return;
      }

      const blueprintContext = document.getElementById("form-blueprint-context")?.value || 'General Inquiry';

      // Aggregate all form data into the consolidated message
      const aggregatedMessage = `
--- GrowSure Infotech Project Inquiry (Modal Form) ---
[PROJECT INQUIRY]: ${projectType}
[BLUEPRINT INTEREST]: ${blueprintContext}
[COMPANY NAME]: ${company}
[PHONE NUMBER]: ${phone}

[BUSINESS IDEA SPECIFICATIONS]:
${details}
      `.trim();

      const payload = {
        fullname: fullname,
        email: email,
        message: aggregatedMessage,
        "g-recaptcha-response": recaptchaToken
      };

      const submitBtn = modalForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending Request...";

      try {
        const endpoint = FORMSPREE_FORM_ID && FORMSPREE_FORM_ID !== "YOUR_FORMSPREE_FORM_ID"
          ? `https://formspree.io/f/${FORMSPREE_FORM_ID}`
          : "https://formspree.io/f/xqaapwld"; // fallback placeholder
        const response = await fetch(
          endpoint,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json"
            },
            body: JSON.stringify(payload)
          }
        );

        const resultText = await response.text();
        let result;
        try {
          result = JSON.parse(resultText);
        } catch {
          result = { message: resultText };
        }

        if (response.ok) {
          document.querySelector(".dialog-content--before").style.display = "none";
          document.querySelector(".dialog-content--after").style.display = "flex";
          modalForm.reset();
          if (typeof grecaptcha !== 'undefined') {
            grecaptcha.reset(0);
          }
        } else {
          errorMsg.textContent = result.error || result.message || "Submission failed";
          errorMsg.style.display = "block";
          if (typeof grecaptcha !== 'undefined') {
            grecaptcha.reset(0);
          }
        }
      } catch (err) {
        errorMsg.textContent = "Network error: " + err.message;
        errorMsg.style.display = "block";
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  }

  // ===================================================
  // EMBEDDED CONTACT FORM HANDLING (Landing page)
  // ===================================================
  const embeddedForm = document.getElementById("contactFormEmbedded");
  if (embeddedForm) {
    embeddedForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const fullname = document.getElementById("fullname_embed").value.trim();
      const company = document.getElementById("company_embed").value.trim() || 'Not Provided';
      const email = document.getElementById("email_embed").value.trim();
      const phone = document.getElementById("phone_embed").value.trim() || 'Not Provided';
      const projectType = document.getElementById("project_type_embed").value;
      const details = document.getElementById("message_embed").value.trim();
      const policy = document.getElementById("policy_embed").checked;
      
      const errorMsg = document.getElementById("errorMsgEmbed");
      const successMsg = document.getElementById("successMsgEmbed");

      errorMsg.style.display = "none";
      successMsg.style.display = "none";
      errorMsg.textContent = "";
      successMsg.textContent = "";

      if (!fullname || !email || !projectType || !details || !policy) {
        errorMsg.textContent = "Please fill in all required fields.";
        errorMsg.style.display = "block";
        return;
      }

      // reCAPTCHA validation (for secondary captcha widget on page)
      let recaptchaToken = "";
      if (typeof grecaptcha !== 'undefined') {
        // Since there are two recaptchas on the page, the second one has widget index 1
        try {
          recaptchaToken = grecaptcha.getResponse(1);
        } catch {
          recaptchaToken = grecaptcha.getResponse(0);
        }
      }

      if (!recaptchaToken) {
        errorMsg.textContent = "Please confirm that you are not a robot.";
        errorMsg.style.display = "block";
        return;
      }

      const blueprintContextEmbed = document.getElementById("form-blueprint-context-embed")?.value || 'General Inquiry';

      // Aggregate all form data into the consolidated message
      const aggregatedMessage = `
--- GrowSure Infotech Project Inquiry (Embedded Form) ---
[PROJECT INQUIRY]: ${projectType}
[BLUEPRINT INTEREST]: ${blueprintContextEmbed}
[COMPANY NAME]: ${company}
[PHONE NUMBER]: ${phone}

[BUSINESS IDEA SPECIFICATIONS]:
${details}
      `.trim();

      const payload = {
        fullname: fullname,
        email: email,
        message: aggregatedMessage,
        "g-recaptcha-response": recaptchaToken
      };

      const submitBtn = embeddedForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending Request...";

      try {
        const endpoint = FORMSPREE_FORM_ID && FORMSPREE_FORM_ID !== "YOUR_FORMSPREE_FORM_ID"
          ? `https://formspree.io/f/${FORMSPREE_FORM_ID}`
          : "https://formspree.io/f/xqaapwld"; // fallback placeholder
        const response = await fetch(
          endpoint,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json"
            },
            body: JSON.stringify(payload)
          }
        );

        const resultText = await response.text();
        let result;
        try {
          result = JSON.parse(resultText);
        } catch {
          result = { message: resultText };
        }

        if (response.ok) {
          successMsg.textContent = "Thanks! Your message was sent successfully. We'll be in touch shortly.";
          successMsg.style.display = "block";
          embeddedForm.reset();
          if (typeof grecaptcha !== 'undefined') {
            try {
              grecaptcha.reset(1);
            } catch {
              grecaptcha.reset(0);
            }
          }
        } else {
          errorMsg.textContent = result.error || result.message || "Submission failed";
          errorMsg.style.display = "block";
          if (typeof grecaptcha !== 'undefined') {
            try {
              grecaptcha.reset(1);
            } catch {
              grecaptcha.reset(0);
            }
          }
        }
      } catch (err) {
        errorMsg.textContent = "Network error: " + err.message;
        errorMsg.style.display = "block";
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  }

  // ===================================================
  // DEDICATED CONTACT PAGE FORM HANDLING
  // ===================================================
  const pageForm = document.getElementById("contactFormPage");
  if (pageForm) {
    pageForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const fullname = document.getElementById("fullname_page").value.trim();
      const company = document.getElementById("company_page").value.trim() || 'Not Provided';
      const email = document.getElementById("email_page").value.trim();
      const phone = document.getElementById("phone_page").value.trim() || 'Not Provided';
      const projectType = document.getElementById("project_type_page").value;
      const details = document.getElementById("message_page").value.trim();
      const policy = document.getElementById("policy_page").checked;
      
      const errorMsg = document.getElementById("errorMsgPage");
      const successMsg = document.getElementById("successMsgPage");

      errorMsg.style.display = "none";
      successMsg.style.display = "none";
      errorMsg.textContent = "";
      successMsg.textContent = "";

      if (!fullname || !email || !projectType || !details || !policy) {
        errorMsg.textContent = "Please fill in all required fields.";
        errorMsg.style.display = "block";
        return;
      }

      // reCAPTCHA validation (for contact page widget)
      let recaptchaToken = "";
      if (typeof grecaptcha !== 'undefined') {
        try {
          recaptchaToken = grecaptcha.getResponse();
        } catch {
          try {
            recaptchaToken = grecaptcha.getResponse(0);
          } catch {}
        }
      }

      if (!recaptchaToken) {
        errorMsg.textContent = "Please confirm that you are not a robot.";
        errorMsg.style.display = "block";
        return;
      }

      // Aggregate all form data into the consolidated message
      const aggregatedMessage = `
--- GrowSure Infotech Project Inquiry (Contact Page Form) ---
[PROJECT INQUIRY]: ${projectType}
[COMPANY NAME]: ${company}
[PHONE NUMBER]: ${phone}

[BUSINESS IDEA SPECIFICATIONS]:
${details}
      `.trim();

      const payload = {
        fullname: fullname,
        email: email,
        message: aggregatedMessage,
        "g-recaptcha-response": recaptchaToken
      };

      const submitBtn = pageForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending Request...";

      try {
        const endpoint = FORMSPREE_FORM_ID && FORMSPREE_FORM_ID !== "YOUR_FORMSPREE_FORM_ID"
          ? `https://formspree.io/f/${FORMSPREE_FORM_ID}`
          : "https://formspree.io/f/xqaapwld"; // fallback placeholder
        const response = await fetch(
          endpoint,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json"
            },
            body: JSON.stringify(payload)
          }
        );

        const resultText = await response.text();
        let result;
        try {
          result = JSON.parse(resultText);
        } catch {
          result = { message: resultText };
        }

        if (response.ok) {
          successMsg.textContent = "Thanks! Your message was sent successfully. We'll be in touch shortly.";
          successMsg.style.display = "block";
          pageForm.reset();
          if (typeof grecaptcha !== 'undefined') {
            try {
              grecaptcha.reset();
            } catch {
              try {
                grecaptcha.reset(0);
              } catch {}
            }
          }
        } else {
          errorMsg.textContent = result.error || result.message || "Submission failed";
          errorMsg.style.display = "block";
          if (typeof grecaptcha !== 'undefined') {
            try {
              grecaptcha.reset();
            } catch {
              try {
                grecaptcha.reset(0);
              } catch {}
            }
          }
        }
      } catch (err) {
        errorMsg.textContent = "Network error: " + err.message;
        errorMsg.style.display = "block";
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  }

});

// Lottie Animations Autoplay/Scroll Handler
document.addEventListener("DOMContentLoaded", function () {
  const lottiePlayers = document.querySelectorAll(".lottie");

  if (lottiePlayers.length === 0 || typeof lottie === 'undefined') return;

  function initLottieAnimation(player) {
    const path = player.getAttribute("src");
    const loop = player.getAttribute("data-loop") === "true";
    const autoplay = player.getAttribute("data-autoplay") === "true";

    const animation = lottie.loadAnimation({
      container: player,
      renderer: "svg",
      loop: loop,
      autoplay: autoplay,
      path: path,
    });

    player.lottieAnimation = animation;

    if (!autoplay) {
      player.classList.add("animation-not-initiated");
    }
  }

  lottiePlayers.forEach(initLottieAnimation);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const player = entry.target;
        const dataThreshold = parseFloat(player.getAttribute("data-threshold")) || 0.2;

        if (
          entry.isIntersecting &&
          entry.intersectionRatio >= dataThreshold &&
          player.classList.contains("animation-not-initiated")
        ) {
          if (player.lottieAnimation) {
            if (player.lottieAnimation.isLoaded) {
              player.lottieAnimation.play();
            } else {
              player.lottieAnimation.addEventListener("DOMLoaded", () => {
                player.lottieAnimation.play();
              });
            }
            player.classList.remove("animation-not-initiated");
            observer.unobserve(player);
          }
        }
      });
    },
    { threshold: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0] }
  );

  lottiePlayers.forEach((player) => {
    if (player.getAttribute("data-autoplay") === "false") {
      observer.observe(player);
    }
  });

  // Back to Top button handler
  const backToTopBtn = document.getElementById("backToTop");
  if (backToTopBtn) {
    window.addEventListener("scroll", function() {
      if (window.scrollY > window.innerHeight * 0.5) {
        backToTopBtn.classList.add("visible");
      } else {
        backToTopBtn.classList.remove("visible");
      }
    });

    backToTopBtn.addEventListener("click", function() {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  }
});

// 2. Safe Execution Wrapper for Lottie Components
window.initializeLottieSafe = function(targetElementId, assetSourcePath) {
  const renderNode = document.getElementById(targetElementId);
  
  if (renderNode && typeof lottie !== "undefined") {
    try {
      return lottie.loadAnimation({
        container: renderNode,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: assetSourcePath
      });
    } catch (runtimeError) {
      console.error(`[Lottie Engine Fail] Interaction fault on target: ${targetElementId}`, runtimeError);
    }
  } else {
    console.warn(`[Safe Mode Watchdog] Missing target DOM Node or Lottie core engine for: ${targetElementId}`);
  }
  return null;
};
