// FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyAxhhXU90GluSwrjaoqxmP23bgfHR18ez4",
  authDomain: "secretserver-chat.firebaseapp.com",
  projectId: "secretserver-chat",
  storageBucket: "secretserver-chat.appspot.com",
  messagingSenderId: "105772354036",
  appId: "1:105772354036:web:b3962f9ec0260be47491a1",
  measurementId: "G-2FY0BDMFWD"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const firestore = firebase.firestore();


// Fungsi untuk menutup side panel
function closePanel(panelId) {
  document.getElementById(panelId).style.transform = "translateX(-100%)";
}

document.addEventListener("DOMContentLoaded", () => {
  // Event listeners untuk sidebar icons
  document.getElementById('userProfile').addEventListener('click', () => openPanel('profile'));
  document.getElementById('settings').addEventListener('click', () => openPanel('settingsPanel'));
  document.getElementById('aboutApp').addEventListener('click', () => openPanel('aboutPanel'));

// Logout User dengan Custom Dialog
document.getElementById('logout').addEventListener('click', () => {
  const dialog = document.getElementById('custom-logout-dialog');
  dialog.style.display = 'flex';

  // Tombol konfirmasi logout
  document.getElementById('confirm-logout').addEventListener('click', () => {
    auth.signOut()
      .then(() => {
        window.location.replace("https://tolepcoy.github.io/SecretServer/index.html");
      })
      .catch(error => {
        console.error("Error saat logout:", error);
      });
  });

  // Tombol batal logout
  document.getElementById('cancel-logout').addEventListener('click', () => {
    dialog.style.display = 'none';
  });
});
/* kustom alert end */

// Fungsi untuk membuka side panel
function openPanel(panelId) {
  const panels = ['profile', 'settingsPanel', 'aboutPanel'];
  panels.forEach(panel => {
    document.getElementById(panel).style.transform = panel === panelId ? "translateX(0)" : "translateX(-100%)";
  });
}

// Fungsi untuk menampilkan profil user setelah login
firebase.auth().onAuthStateChanged(user => {
  if (user) {
    const userRef = firestore.collection('userSS').doc(user.uid);
    userRef.get().then(doc => {
      if (doc.exists) {
        const data = doc.data();
        // Update elemen HTML dengan data user yang diambil dari Firestore
        document.getElementById('username').innerText = data.username;
        document.getElementById('avatar').src = data.avatar;
        document.getElementById('status').innerText = data.status;
        document.getElementById('detail').innerText = data.detail;
        document.getElementById('lokasi').innerText = data.lokasi;
        document.getElementById('umur').innerText = data.umur;
        document.getElementById('gender').innerText = data.gender;
        document.getElementById('rate').innerText = data.rate;
        document.getElementById('bergabung').innerText = data.bergabung;
      } else {
        console.log("User data not found in Firestore");
      }
    }).catch(error => console.error("Error fetching user data:", error));
  } else {
    console.log("User not logged in");
  }
});
});

// EDIT NAMA
const namaEl = document.getElementById('nama');
const editNamaBtn = document.getElementById('edit-username');

// Fungsi untuk handle klik tombol edit
editNamaBtn.addEventListener('click', () => {
  // Menunggu user login terlebih dahulu
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      // Simpan value lama
      const currentNama = namaEl.textContent.trim();

      // Ubah h2 menjadi input
      namaEl.innerHTML = `
        <input type="text" id="nama-input" value="${currentNama}" maxlength="15" />
        <button id="save-nama">Save</button>
      `;

      // Ambil elemen input dan tombol save
      const namaInput = document.getElementById('nama-input');
      const saveBtnNama = document.getElementById('save-nama');

      // Fokuskan input
      namaInput.focus();

      // Handle klik tombol save
      saveBtnNama.addEventListener('click', async () => {
        const newNama = namaInput.value.trim();

        // Validasi nama
        if (!/^[a-zA-Z\s]{1,15}$/.test(newNama)) {
          alert("Nama hanya boleh huruf dan spasi, maksimal 15 karakter.");
          return;
        }

        // Simpan ke Firestore
        try {
          const userDef = firestore.collection('userSS').doc(user.uid);
          await userDef.update({ nama: newNama }); // Update field "nama"

          // Kembalikan tampilan awal
          namaEl.textContent = newNama;
        } catch (error) {
          console.error("Gagal update nama:", error);
          alert("Gagal menyimpan nama baru, coba lagi.");
        }
      });
    } else {
      console.log("User not logged in");
    }
  });
});

// EDIT AVATAR
const avatarEl = document.getElementById('avatar');
const editAvatarBtn = document.getElementById('edit-avatar');

// Fungsi untuk handle klik tombol edit avatar
editAvatarBtn.addEventListener('click', () => {
  // Ubah gambar menjadi input file
  avatarEl.innerHTML = `
    <input type="file" id="avatar-input" accept="image/jpeg" />
    <button id="save-avatar">Save</button>
  `;

  const avatarInput = document.getElementById('avatar-input');
  const saveBtnAvatar = document.getElementById('save-avatar');

  // Handle klik tombol save
  saveBtnAvatar.addEventListener('click', async () => {
    const file = avatarInput.files[0]; // Ambil file yang dipilih

    if (!file) {
      alert("Silakan pilih gambar terlebih dahulu.");
      return;
    }

    // Validasi format file
    if (file.type !== 'image/jpeg') {
      alert("Hanya file gambar JPEG yang diperbolehkan.");
      return;
    }

    // Upload gambar ke Imgur
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('https://api.imgur.com/3/image', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer 6e72b748a0d7becd6751810b6c1557de073ccb0e' // Ganti dengan token Imgur milikmu
        },
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        const imageUrl = result.data.link; // Dapatkan URL gambar yang di-upload

        // Update avatar di Firestore
        const userDef2 = firestore.collection('userSS').doc(user.uid);
        await userDef2.update({ avatar: imageUrl });

        // Update tampilan gambar avatar di halaman
        avatarEl.innerHTML = `<img id="avatar" src="${imageUrl}" />`;
      } else {
        alert("Gagal upload gambar, coba lagi.");
      }
    } catch (error) {
      console.error("Gagal upload gambar:", error);
      alert("Terjadi kesalahan, coba lagi.");
    }
  });
});