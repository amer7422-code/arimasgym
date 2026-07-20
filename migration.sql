-- AddMemberProfileFields
-- إضافة حقول الملف الشخصي الاختيارية لجدول users
-- كل الحقول Nullable، لذا هذا Migration آمن ولا يتطلب قيمة افتراضية
-- ولن يكسر أي صف موجود حالياً في القاعدة

ALTER TABLE "users" ADD COLUMN "full_name" TEXT;
ALTER TABLE "users" ADD COLUMN "phone_number" TEXT;
ALTER TABLE "users" ADD COLUMN "birth_date" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN "gender" TEXT;
