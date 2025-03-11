-- AlterTable
ALTER TABLE "Listener" ADD COLUMN     "carouselTemplateId" UUID;

-- AddForeignKey
ALTER TABLE "Listener" ADD CONSTRAINT "Listener_carouselTemplateId_fkey" FOREIGN KEY ("carouselTemplateId") REFERENCES "CarouselTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
