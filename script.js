let questionsData = [];
let currentStep = 0;
let currentAnswers = {};

fetch("questions.json")
  .then((response) => response.json())
  .then((data) => {
    questionsData = data;
    startQuestionnaire();
  })
  .catch((error) => {
    console.error("Veri yüklenirken hata oluştu:", error);
  });

function startQuestionnaire() {
  if (!questionsData || !questionsData.length) {
    console.error("Sorular verisi yüklenemedi.");
    return;
  }
  showQuestion(currentStep);
}

function showQuestion(stepIndex) {
  const question = questionsData[0].steps[stepIndex];
  const questionContainer = document.getElementById("question-container");
  const nextButton = document.getElementById("next-btn");
  const backButton = document.getElementById("back-btn");

  questionContainer.innerHTML = `
    <h2>${question.title}</h2>
    <div id="answers"></div>
  `;

  const answersContainer = document.getElementById("answers");
  answersContainer.innerHTML = "";

  if (question.title === "Hangi renk?") {
    const colorMap = {
      siyah: "black",
      beyaz: "white",
      kırmızı: "red",
      mavi: "blue",
      yeşil: "green",
      sarı: "yellow",
      turuncu: "orange",
      mor: "purple",
      pembe: "pink",
      gri: "gray",
      kahverengi: "brown",
    };

    question.answers.forEach((turkishColor) => {
      const englishColor = colorMap[turkishColor.toLowerCase()] || "gray"; // Bilinmeyen renkleri gri yap

      const colorCircle = document.createElement("div");
      colorCircle.classList.add("color-circle");
      colorCircle.style.backgroundColor = englishColor;
      colorCircle.dataset.color = turkishColor;

      // Seçildiğinde vurgulamak için event listener
      colorCircle.onclick = () => {
        document
          .querySelectorAll(".color-circle")
          .forEach((el) => el.classList.remove("selected"));
        colorCircle.classList.add("selected");
        selectAnswer(turkishColor, question.title);
      };

      answersContainer.appendChild(colorCircle);
    });
  } else {
    // Normal butonlarla seçenekleri göster
    question.answers.forEach((answer) => {
      const answerElement = document.createElement("button");
      answerElement.textContent = answer;
      answerElement.onclick = () => selectAnswer(answer, question.title);
      answersContainer.appendChild(answerElement);
    });
  }

  nextButton.onclick = () => {
    if (!currentAnswers[question.title]) {
      alert("Lütfen bir seçenek seçin.");
    } else {
      currentStep++;
      if (currentStep < questionsData[0].steps.length) {
        showQuestion(currentStep);
      } else {
        questionContainer.innerHTML = "";
        answersContainer.innerHTML = "";
        nextButton.style.display = "none";
        backButton.style.display = "none";
        displayProducts();
      }
    }
  };

  backButton.onclick = () => {
    if (currentStep > 0) {
      currentStep--;
      showQuestion(currentStep);
    }
  };
}

function selectAnswer(answer, questionTitle) {
  currentAnswers[questionTitle] = answer;
}

function displayProducts() {
  fetch("products.json")
    .then((response) => response.json())
    .then((products) => {
      const filteredProducts = products.filter((product) => {
        let isValid = true;

        if (currentAnswers["Hangi kategoride ürün arıyorsunuz?"]) {
          const selectedCategory =
            currentAnswers["Hangi kategoride ürün arıyorsunuz?"];
          if (
            !product.category.some((cat) =>
              cat.toLowerCase().includes(selectedCategory.toLowerCase())
            )
          ) {
            isValid = false;
          }
        }

        if (currentAnswers["Hangi renk?"]) {
          const selectedColor = currentAnswers["Hangi renk?"];
          if (
            !product.colors.some(
              (color) => color.toLowerCase() === selectedColor.toLowerCase()
            )
          ) {
            isValid = false;
          }
        }

        if (currentAnswers["Fiyat aralığı seçiniz"]) {
          const priceRange = currentAnswers["Fiyat aralığı seçiniz"];
          if (!isValidPriceRange(product.price, priceRange)) {
            isValid = false;
          }
        }

        return isValid;
      });

      const productList = document.getElementById("product-list");
      productList.innerHTML = "";

      if (filteredProducts.length === 0) {
        productList.innerHTML = "<p>No product found :(.</p>";
      } else {
        let currentIndex = 0;
        const sliderContainer = document.createElement("div");
        sliderContainer.classList.add("product-slider");

        const productCard = document.createElement("div");
        productCard.classList.add("product-card");

        const dotsContainer = document.createElement("div");
        dotsContainer.classList.add("dots-container");

        function updateProductCard(index) {
          const product = filteredProducts[index];
          productCard.innerHTML = `
            <a style="text-decoration:none" href="${product.url}" target="_blank">
              <img src="${product.image}" alt="${product.name}">
              <h3>${product.name}</h3>
              <p class="old-price">${product.oldPriceText}</p>
              <p>${product.priceText}</p>
              <button class="view-btn">View Product</button>
            </a>
          `;

          // Noktaların aktif durumunu güncelle
          document.querySelectorAll(".dot").forEach((dot, i) => {
            dot.classList.toggle("active", i === index);
          });
        }

        filteredProducts.forEach((_, i) => {
          const dot = document.createElement("span");
          dot.classList.add("dot");
          if (i === 0) dot.classList.add("active");

          dot.onclick = () => {
            currentIndex = i;
            updateProductCard(currentIndex);
          };

          dotsContainer.appendChild(dot);
        });

        updateProductCard(currentIndex);

        const prevButton = document.createElement("button");
        prevButton.textContent = "<";
        prevButton.classList.add("prev-p-btn");
        prevButton.onclick = () => {
          if (currentIndex > 0) {
            currentIndex--;
            updateProductCard(currentIndex);
          }
        };

        const nextButton = document.createElement("button");
        nextButton.textContent = ">";
        nextButton.classList.add("next-p-btn");
        nextButton.onclick = () => {
          if (currentIndex < filteredProducts.length - 1) {
            currentIndex++;
            updateProductCard(currentIndex);
          }
        };

        sliderContainer.appendChild(prevButton);
        sliderContainer.appendChild(productCard);
        sliderContainer.appendChild(nextButton);
        productList.appendChild(sliderContainer);
        productList.appendChild(dotsContainer);
      }
    })
    .catch((error) => {
      console.error("Ürün verileri yüklenirken hata oluştu:", error);
    });
}

function isValidPriceRange(price, priceRange) {
  if (priceRange === "0-1000" && price <= 1000) return true;
  if (priceRange === "1000-2000" && price > 1000 && price <= 2000) return true;
  if (priceRange === "2000+" && price > 2000) return true;
  return false;
}
