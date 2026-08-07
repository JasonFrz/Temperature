
---

## 🏗️ Alur Sistem (System Flow)

1. **Input (ESP32 / Sensor):** Perangkat keras (seperti ESP32) membaca data dari lingkungan sekitar dan mengirimkan data tersebut ke Server Backend melalui HTTP POST request.
2. **Backend (Node.js + Express):** Server menerima HTTP POST tersebut, menyimpan data terbarunya secara sementara di dalam *memory* (RAM), lalu seketika itu juga (tanpa delay) menyiarkan (*broadcast*) data tersebut ke semua Frontend yang sedang terkoneksi menggunakan protokol **WebSocket**.
3. **Frontend (React + Vite):** Tampilan web (*Client*) tidak perlu me-refresh halaman atau terus-menerus bertanya ke server. Melalui koneksi WebSocket (`socket.io-client`), tampilan akan langsung bereaksi dan memperbarui angka sensor di layar dalam hitungan milidetik setelah ESP32 mengirim data.

---

## 🧭 Konsep Routing & ID Ruangan

Aplikasi ini tidak memiliki batasan jumlah sensor (Anda bisa menambahkan 100 ruangan tanpa mengubah kode aplikasi). Semuanya diatur melalui **ID**.

### 1. Control Room (Dashboard Utama)
- **URL:** `http://namadomain.com/` (tanpa tambahan apapun)
- Menampilkan seluruh sensor/ruangan yang sedang **aktif** (mengirim data dalam 15 detik terakhir). 
- Jika sensor mati atau offline lebih dari 15 detik, angkanya akan otomatis menjadi 0.
- Setiap ruangan akan ditampilkan dalam satu kotak (grid) yang berisi *Carousel* suhu, kelembaban, dan tekanan.

### 2. Single View (Fokus 1 Ruangan)
- **URL:** `http://namadomain.com/?id=ruang-server`
- Jika Anda menambahkan parameter `?id=<nama_id>` di belakang URL, aplikasi akan masuk ke mode *Single View*.
- Layar akan sepenuhnya fokus menampilkan data hanya dari `ruang-server`. Angka akan ditampilkan sangat besar, cocok untuk dipajang di Smart TV atau tablet yang ditempel di dinding ruangan tersebut.

---

## 📁 Struktur File 

Berikut adalah anatomi dari kode sumber proyek ini:

### `/api` (Backend)
*   **`api/index.js`**
    *File inti dari server (Backend).* Berisi logika HTTP Express dan WebSocket (`socket.io`). Bertugas sebagai penerima data dari ESP32 (`POST /api/sensor`), menyimpan data di variabel `sensorsData`, menyiarkan update ke frontend via socket, dan sekaligus bertugas menyajikan (serve) file *build* frontend ke publik.

### `/frontend`
*   **`frontend/src/App.jsx`**
    *Otak dari tampilan.* Menghandle koneksi WebSocket, membaca parameter URL (`?id=`), menentukan apakah harus merender `ControlRoom` (layar utama) atau `Carousel` (fokus 1 ruangan), serta mendeteksi ukuran layar (jika diakses via HP, sistem slide dinonaktifkan).
*   **`frontend/src/components/ControlRoom.jsx`**
    Komponen untuk halaman utama. Menampilkan kotak-kotak (*grid*) dari semua ruangan yang aktif.
*   **`frontend/src/components/Carousel.jsx`**
    Komponen pembungkus (Wrapper) yang mengatur fitur *slide* (geser otomatis) setiap 5 detik. Digunakan di *Single View* maupun di dalam *Control Room*.
*   **`frontend/src/components/SensorCard.jsx` & `.css`**
    Komponen visual penampil angka (Suhu/Kelembaban/Tekanan). Dilengkapi dengan logika *Container Queries* sehingga font angka bisa membesar/mengecil secara ajaib tanpa pecah menyesuaikan ruang kosong di layar.
*   **`frontend/src/components/Clock.jsx`**
    Komponen jam *real-time* yang terisolasi. Sengaja dipisah dari `App.jsx` agar detak jam (setiap 1 detik) tidak membebani dan merender ulang seluruh komponen aplikasi (mencegah *bottleneck*).


---

## 📡 Cara Mengirim Data (Dari ESP32 / Arduino)

Alat (mikrokontroler) Anda hanya perlu mengirimkan satu **HTTP POST Request** berformat JSON ke alamat server.

**Endpoint:**  
`POST http://namadomain.com:5000/api/sensor`

**Contoh Payload JSON:**
```json
{
  "id": "ruang-server",
  "temperature": 24.5,
  "humidity": 60.1,
  "pressure": 1012.3
}
```




