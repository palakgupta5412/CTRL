// Check if we already injected so we don't stack overlays
if (!document.getElementById('ctrl-roast-overlay')) {
  
  const ROASTS = [
    { title: "Placements are Here.", body: "You are in your 3rd year of IT. Yesterday's mock test was just a warmup. Close this tab and go grind DSA." },
    { title: "Java & DSA > This.", body: "Every minute you spend reading this is a minute someone else is mastering dynamic programming in Java. Don't get outworked." },
    { title: "MERN Stack Reality Check", body: "Building Planify and carpool platforms is great, but scrolling here won't help you clear the technical rounds. Get back to the terminal." },
    { title: "UI/UX Over Logic?", body: "Front-end animations won't save you if you fail the algorithm interview. Shut this down." },
    { title: "Focus Not Found.", body: "The recruiters do not care about your web browsing history. Stop the mindless scrolling and go lock in." }
  ];

  const randomRoast = ROASTS[Math.floor(Math.random() * ROASTS.length)];

  // 1. Create the overlay container
  const overlay = document.createElement('div');
  overlay.id = 'ctrl-roast-overlay';
  
  // 2. Add aggressive styling and CSS animations
  const style = document.createElement('style');
  style.innerHTML = `
    #ctrl-roast-overlay {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      background: rgba(9, 9, 11, 0.95) !important;
      backdrop-filter: blur(12px) !important;
      z-index: 2147483647 !important; /* Maximum possible z-index */
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
      font-family: system-ui, -apple-system, sans-serif !important;
      color: white !important;
    }
    .ctrl-roast-box {
      max-width: 48rem !important;
      text-align: center !important;
      padding: 3rem !important;
      border: 1px solid #7f1d1d !important;
      background: rgba(0, 0, 0, 0.8) !important;
      border-radius: 1rem !important;
      box-shadow: 0 0 100px rgba(220, 38, 38, 0.2) !important;
      animation: ctrlSlam 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards !important;
    }
    @keyframes ctrlSlam {
      0% { transform: translateY(-100px) scale(0.8) rotateX(20deg); opacity: 0; }
      100% { transform: translateY(0) scale(1) rotateX(0); opacity: 1; }
    }
    .ctrl-title {
      font-size: 3.75rem !important;
      font-weight: 900 !important;
      color: #dc2626 !important;
      margin-bottom: 1.5rem !important;
      text-transform: uppercase !important;
      letter-spacing: -0.05em !important;
      line-height: 1 !important;
    }
    .ctrl-body {
      font-size: 1.5rem !important;
      color: #d4d4d8 !important;
      margin-bottom: 2rem !important;
      font-weight: 300 !important;
      line-height: 1.625 !important;
    }
    .ctrl-btn {
      padding: 1rem 2rem !important;
      background: #dc2626 !important;
      color: white !important;
      font-weight: 700 !important;
      font-size: 1.125rem !important;
      border: none !important;
      border-radius: 0.25rem !important;
      cursor: pointer !important;
      box-shadow: 0 10px 15px -3px rgba(127, 29, 29, 0.5) !important;
      transition: background 0.2s !important;
    }
    .ctrl-btn:hover { background: #ef4444 !important; }
  `;

  // 3. Build the HTML structure
  overlay.innerHTML = `
    <div class="ctrl-roast-box">
      <h1 class="ctrl-title">${randomRoast.title}</h1>
      <p class="ctrl-body">${randomRoast.body}</p>
      <button class="ctrl-btn" id="ctrl-escape-btn">Face Reality & Code</button>
    </div>
  `;

  // 4. Inject into the DOM
  document.head.appendChild(style);
  document.body.appendChild(overlay);

  // 5. Wire up the button to escape to LeetCode
  document.getElementById('ctrl-escape-btn').addEventListener('click', () => {
    window.location.href = 'https://leetcode.com/problemset/all/';
  });

  // 6. Stop the user from scrolling the background
  document.body.style.overflow = 'hidden';
}