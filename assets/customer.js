const selectors = {
  customerAddresses: '[data-customer-addresses]',
  addressCountrySelect: '[data-address-country-select]',
  addressContainer: '[data-address]',
  toggleAddressButton: 'button[aria-expanded]',
  cancelAddressButton: 'button[type="reset"]',
  deleteAddressButton: 'button[data-confirm-message]',
};

const attributes = {
  expanded: 'aria-expanded',
  confirmMessage: 'data-confirm-message',
};

class CustomerAddresses {
  constructor() {
    this.elements = this._getElements();
    if (Object.keys(this.elements).length === 0) return;
    this._setupCountries();
    this._setupEventListeners();
  }

  _getElements() {
    const container = document.querySelector(selectors.customerAddresses);
    return container
      ? {
        container,
        addressContainer: container.querySelector(selectors.addressContainer),
        toggleButtons: document.querySelectorAll(selectors.toggleAddressButton),
        cancelButtons: container.querySelectorAll(selectors.cancelAddressButton),
        deleteButtons: container.querySelectorAll(selectors.deleteAddressButton),
        countrySelects: container.querySelectorAll(selectors.addressCountrySelect),
      }
      : {};
  }

  _setupCountries() {
    if (Shopify && Shopify.CountryProvinceSelector) {
      new Shopify.CountryProvinceSelector('AddressCountryNew', 'AddressProvinceNew', {
        hideElement: 'AddressProvinceContainerNew',
      });
      this.elements.countrySelects.forEach((select) => {
        const formId = select.dataset.formId;
        new Shopify.CountryProvinceSelector(`AddressCountry_${formId}`, `AddressProvince_${formId}`, {
          hideElement: `AddressProvinceContainer_${formId}`,
        });
      });
    }
  }

  _setupEventListeners() {
    this.elements.toggleButtons.forEach((element) => {
      element.addEventListener('click', this._handleAddEditButtonClick);
    });
    this.elements.cancelButtons.forEach((element) => {
      element.addEventListener('click', this._handleCancelButtonClick);
    });
    this.elements.deleteButtons.forEach((element) => {
      element.addEventListener('click', this._handleDeleteButtonClick);
    });
  }

  _toggleExpanded(target) {
    target.setAttribute(attributes.expanded, (target.getAttribute(attributes.expanded) === 'false').toString());
  }

  _handleAddEditButtonClick = ({ currentTarget }) => {
    this._toggleExpanded(currentTarget);
  };

  _handleCancelButtonClick = ({ currentTarget }) => {
    this._toggleExpanded(currentTarget.closest(selectors.addressContainer).querySelector(`[${attributes.expanded}]`));
  };

  _handleDeleteButtonClick = ({ currentTarget }) => {
    if (confirm(currentTarget.getAttribute(attributes.confirmMessage))) {
      Shopify.postLink(currentTarget.dataset.target, {
        parameters: { _method: 'delete' },
      });
    }
  };
}


document.addEventListener('DOMContentLoaded', function () {
  const dropdownTrigger = document.querySelector('.dropdown-trigger');
  const dropdownContent = document.querySelector('.dropdown-content');
  const dropdownItems = document.querySelectorAll('.dropdown-content li');
  const selectedOption = document.querySelector('.selected-option');
  const selectedPrice = document.querySelector('.selected-price');
  const product = document.getElementById('custom_product');

  dropdownTrigger.addEventListener('click', function (e) {
    e.stopPropagation();
    const isActive = dropdownContent.classList.contains('active');

    closeAllDropdowns();

    if (!isActive) {
      dropdownContent.classList.add('active');
      dropdownTrigger.classList.add('active');
    }
  });

  dropdownItems.forEach(item => {
    item.addEventListener('click', function () {
      const variantId = this.getAttribute('data-id');
      const variantTitle = this.getAttribute('data-value');
      const variantPrice = this.getAttribute('data-price');

      selectedOption.textContent = variantTitle;
      selectedPrice.textContent = variantPrice;

      product.setAttribute('data-product-id', variantId);
      product.setAttribute('data-product-price', variantPrice);
      product.setAttribute('data-product-name', variantTitle);



      dropdownItems.forEach(item => item.classList.remove('selected'));
      this.classList.add('selected');

      closeDropdown();

      const event = new CustomEvent('variantSelected', {
        detail: {
          variant: variantTitle,
          price: variantPrice
        }
      });
      document.dispatchEvent(event);
    });
  });

  document.addEventListener('click', function (e) {
    if (!dropdownTrigger.contains(e.target) && !dropdownContent.contains(e.target)) {
      closeDropdown();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeDropdown();
    }
  });

  function closeDropdown() {
    dropdownContent.classList.remove('active');
    dropdownTrigger.classList.remove('active');
  }

  function closeAllDropdowns() {
    document.querySelectorAll('.dropdown-content.active').forEach(dropdown => {
      dropdown.classList.remove('active');
    });
    document.querySelectorAll('.dropdown-trigger.active').forEach(trigger => {
      trigger.classList.remove('active');
    });
  }

  if (dropdownItems.length > 0) {
    dropdownItems[0].classList.add('selected');
  }
});


document.addEventListener('DOMContentLoaded', function () {
  const tabContainer = document.querySelector('.custom__product-detail');
  const tabs = document.querySelectorAll('.custom__product-detail-tabs li');
  const tabContents = document.querySelectorAll('.custom__product-detail-content');

  function switchTab(tabIndex) {
    tabs.forEach(tab => tab.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));

    tabs[tabIndex].classList.add('active');
    tabContents[tabIndex].classList.add('active');

    const tabId = tabs[tabIndex].id;
    history.replaceState(null, null, `#${tabId}`);
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', function (e) {
      e.preventDefault();
      switchTab(index);
    });
  });

  function checkHash() {
    const hash = window.location.hash.substring(1);
    if (hash) {
      const tabIndex = Array.from(tabs).findIndex(tab => tab.id === hash);
      if (tabIndex !== -1) {
        switchTab(tabIndex);
        return;
      }
    }
    if (tabs.length > 0 && !tabs[0].classList.contains('active')) {
      switchTab(0);
    }
  }

  checkHash();

  window.addEventListener('hashchange', checkHash);
});


// Add to cart functionality

const add_cart_btn = document.getElementById("add_cart");
add_cart_btn.addEventListener('click', function () {
  const add_cart_input = document.getElementById('custom_product');
  const variantId = add_cart_input.getAttribute('data-product-id');

  let formData = {
    'items': [{
      'id': variantId,
      'quantity': 1
    }]
  };

  console.log(formData);
  

  fetch(window.Shopify.routes.root + 'cart/add.js', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData)
  })
    .then(response => {
      return response.json();
    })
    .catch((error) => {
      console.error('Error:', error);
    });

})
