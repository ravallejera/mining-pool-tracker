(function () {

  // Starmon
  function $(selector, context = document) {
    return context.querySelector(selector);
  }
  function $$(selector, context = document) {
    return [...context.querySelectorAll(selector)];
  }

  function serialize(obj) {
    return Object.keys(obj).reduce(function (a, k) { a.push(k + '=' + encodeURIComponent(obj[k])); return a }, []).join('&');
  }


  // Main EVENT
  function tracker() {
    const { body } = document;
    const poolSection = $('div.pool-section', body);
    const set = {
      timeout: {},
      intervarl: {},
      prev: {},
    }

    // handlers
    const getPoolData = () => {
      const items = $$('div.pool-data-item');
      let obj = {
        totalPool: $('div.total-pool-section .item-value', poolSection).textContent,
        totalMiningPower: $('div.item-value', items[0]).textContent,
        totalStakedAmount: $('div.item-value', items[1]).textContent,
        totalStakedTokens: $('div.item-value', items[2]).textContent,
        totalTokenToGet: $('div.item-value', items[4]).textContent,
      }

      Object.keys(obj).forEach(key => {
        obj[key] = parseFloat(obj[key].replace(/,/g, ''));
      });

      return obj;
    };

    const insertIframe = (query = '') => {
      const iframe = document.createElement('iframe');
      iframe.src = `https://192.168.254.101:5000/starmon?${query}`;
      iframe.id = 'pooltracker';
      body.appendChild(iframe);
    }

    const initialize = async () => {
      const d = new Date();
      const data = getPoolData();
      const query = serialize(data);
      const iframe = $('#pooltracker', body);
      let hasChanges = {};

      Object.keys(data).map(key => {
        if (key == 'totalPool') return;
        if (data[key] !== set.prev[key]) {
          hasChanges[key] = {
            old: set.prev[key],
            new: data[key],
            difference: data[key] - set.prev[key],
          }
        }
      });

      if (Object.keys(hasChanges).filter(key => key == 'totalTokenToGet').length > 0) {
        iframe.remove();
        insertIframe(query);
        
        console.log(d.toLocaleTimeString(), hasChanges);
        chrome.runtime.sendMessage('', {
          type: 'notification',
          options: {
            title: 'Starmon Mining Pool Tracker',
            message: `New record added. ${data.totalTokenToGet.toFixed(2)}`,
            iconUrl: '/images/32.png',
            type: 'basic'
          }
        });
      }

      set.prev = data;
    }

    // observer
    const observerConfig = {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
      attributeOldValue: true,
      characterDataOldValue: true,
    }

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        clearTimeout(set.timeout.getdata);
        set.timeout.getdata = setTimeout(() => initialize(), 500);
      }
    });
    observer.observe(poolSection, observerConfig);

    // init
    console.clear();
    console.log('Tracker Initialize!')
    insertIframe();
  }
  tracker();

  chrome.runtime.sendMessage('', {
    type: 'notification',
    options: {
      title: 'Starmon Mining Pool Tracker',
      message: 'Initialize!',
      iconUrl: '/images/32.png',
      type: 'basic'
    }
  });
})();
