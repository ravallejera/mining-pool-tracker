import { useEffect, useRef, useState } from "react";

export default function Starmon() {
  const [status, setStatus] = useState('Fetching data...');


  const gSheetData = (rows) => {
    const obj = {};
    const keys = rows[0];
    const last = rows.slice(-1).pop();

    keys.map((key, index) => {
      if (key == 'date') {
        obj[key] = last[index];
      }
      else {
        obj[key] = parseFloat(last[index].replace(/,/g, ''))
      }
    });

    return obj;
  }

  const queryToObj = (query) => {
    query = query.replace(/\?/gi, '');
    const items = query.split('&');
    const obj = {};

    items.map(item => {
      const entry = item.split('=');
      obj[entry[0]] = parseFloat(entry[1].replace(/,/g, ''));
    });

    return obj;
  }


  // get
  useEffect(async () => {
    const { search } = window.location;

    if (search == '') {
      setStatus('No query to process.')
      return;
    }

    const queryObj = await queryToObj(search);
    let hasChanges = [];

    const prevObj = await fetch('/api/starmon', { method: 'get' })
      .then(res => res.json())
      .then(res => {
        if (res.status == 200) {
          const rows = res.getRows.values || [];
          setStatus('Fetching data success!');
          return rows.length > 2 ? gSheetData(rows) : {};
        }

        setStatus('Fetching data failed!');
        return;
      });

    if (prevObj) {
      Object.keys(queryObj).map(key => {
        if (key == 'totalPool') return;
        if (queryObj[key] !== prevObj[key])
          hasChanges.push({
            [key]: [prevObj[key], queryObj[key]],
            difference: queryObj[key] - prevObj[key]
          });
      });
    }

    if (hasChanges.length > 0) {
      await fetch('/api/starmon', {
        method: 'post',
        body: JSON.stringify(queryObj),
      })
        .then(res => res.json())
        .then(res => {
          res.status == 200 && setStatus('New Record Added!')
        });
    }
  }, []);

  return (
    <section>
      <div>status: {status}</div>
    </section>
  )
}