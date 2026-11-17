# FitBox v0.2.0 — on-device computer vision testing release

This prerelease adds bundled MediaPipe Pose Landmarker Lite inference, 15 experimental pose tasks and 7 manual activities; local John/Tina guided coaching; private video import/recording/review; sequential Task Center and check-up/account views; and optional authenticated text-summary sync to Neon Postgres.

Camera frames, raw landmarks and recordings stay on the device. Cloud sync is opt-in and accepts only validated scalar workout summaries and selected profile fields. No cloud LLM is used.

Install FitBox-debug.apk on Android 8.0 or later. The build is debug signed and intended for testing. Source, screenshots, architecture, camera placement for every exercise and verification details are in the repository README.

Web app: https://fitbox-fitness-iot.vercel.app

Stripe sandbox includes three plans, checkout, signed webhooks, authoritative status and billing management/cancellation. Email is demo-preview only by request, with no unrelated product domain connected.

Still pending: a FitBox sender and Resend delivery/verification/recovery; remaining Figma state parity and translations; physical-phone exercise accuracy and hardware Bluetooth validation. This release does not claim complete implementation of all requested Figma screens.
