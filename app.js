const days = 31;
    const table = document.getElementById('workTable');

    // 初始化表格
    for (let i = 0; i < days; i++) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>Day ${i + 1}</td>
        <td><input type="time" id="start${i}" step="60"></td>
        <td><input type="time" id="end${i}" step="60"></td>
        <td id="work${i}">-</td>
        <td id="ot${i}">-</td>
      `;
      table.appendChild(tr);
    }

    function formatHM(minutes) {
      const h = Math.floor(minutes / 60);
      const m = Math.round(minutes % 60);
      return `${h} H ${m} M`;
    }

    function calculateAll() {
      let totalMinutes = 0, totalOT = 0, otDays = 0;
      for (let i = 0; i < days; i++) {
        const start = document.getElementById(`start${i}`).value;
        const end = document.getElementById(`end${i}`).value;

        if (start && end) {
          const startTime = new Date(`2000-01-01T${start}`);
          const endTime = new Date(`2000-01-01T${end}`);
          let diffMin = (endTime - startTime) / (1000 * 60);

          if (diffMin < 0) diffMin += 24 * 60; // 处理跨午夜

          diffMin -= 60; // 减休息 1 小时

          const otMin = diffMin > 480 ? diffMin - 480 : 0; // 超过 8 小时（480 分钟）为加班
          if (otMin > 0) otDays++;

          totalMinutes += diffMin;
          totalOT += otMin;

          document.getElementById(`work${i}`).innerText = formatHM(diffMin);
          document.getElementById(`ot${i}`).innerText = formatHM(otMin);
        } else {
          document.getElementById(`work${i}`).innerText = "-";
          document.getElementById(`ot${i}`).innerText = "-";
        }
      }

      document.getElementById("summary").innerText =
        `总工作时长：${formatHM(totalMinutes)}，其中加班：${formatHM(totalOT)}，共 ${otDays} 天加班`;
    }

    function saveData() {
      const data = {};
      for (let i = 0; i < days; i++) {
        data[`start${i}`] = document.getElementById(`start${i}`).value;
        data[`end${i}`] = document.getElementById(`end${i}`).value;
      }
      localStorage.setItem("workData12", JSON.stringify(data));
      alert("✅ 数据已保存到本地");
    }

    function loadData() {
      const data = JSON.parse(localStorage.getItem("workData12"));
      if (!data) return alert("⚠️ 没有保存的数据！");
      for (let i = 0; i < days; i++) {
        document.getElementById(`start${i}`).value = data[`start${i}`] || '';
        document.getElementById(`end${i}`).value = data[`end${i}`] || '';
      }
      calculateAll();
      alert("✅ 数据已载入");
    }

    function exportCSV() {
      let csv = "日期,上班时间,下班时间,工时,加班\n";
      for (let i = 0; i < days; i++) {
        const day = `Day ${i + 1}`;
        const start = document.getElementById(`start${i}`).value || '';
        const end = document.getElementById(`end${i}`).value || '';
        const work = document.getElementById(`work${i}`).innerText || '-';
        const ot = document.getElementById(`ot${i}`).innerText || '-';
        csv += `${day},${start},${end},${work},${ot}\n`;
      }

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "工作时间记录.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }