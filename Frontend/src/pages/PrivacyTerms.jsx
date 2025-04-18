import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";

export default function PrivacyTerms() {
  return (
    <motion.div
      className="min-h-screen bg-rose-50 p-6 md:p-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="max-w-4xl mx-auto shadow-lg border-rose-200">
        <CardHeader>
          <CardTitle className="text-center text-rose-600 text-3xl font-bold">
            Privacy Policy & Terms of Service
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[70vh] pr-4">
            <div className="space-y-6 text-rose-900 text-base leading-relaxed">
              <section>
                <h2 className="text-xl font-semibold text-rose-700 mb-2">1. Introduction</h2>
                <p>
                  Welcome to our Rural Girls' Digital Empowerment Platform. We are dedicated to providing a safe, respectful, and enriching learning environment for young girls to explore coding, digital skills, and entrepreneurship.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-rose-700 mb-2">2. Privacy Policy</h2>
                <ul className="list-disc list-inside space-y-2">
                  <li>We collect minimal personal information only to enhance the learning experience.</li>
                  <li>Your data is never sold or shared with third-party vendors.</li>
                  <li>All saved preferences and progress are securely stored using browser localStorage or Firebase Auth (if applicable).</li>
                  <li>You have the right to delete your account and associated data anytime.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-rose-700 mb-2">3. Terms of Service</h2>
                <ul className="list-disc list-inside space-y-2">
                  <li>By using this platform, you agree to be respectful toward mentors, peers, and content.</li>
                  <li>All toolkit materials and educational content are for personal use only and must not be redistributed.</li>
                  <li>Admins reserve the right to remove any content that is inappropriate or violates community standards.</li>
                  <li>This platform is intended for educational and empowerment purposes only.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-rose-700 mb-2">4. Changes to Policy</h2>
                <p>
                  We may update our policies occasionally to reflect improvements or changes. You’ll be notified of any significant updates via the platform.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-rose-700 mb-2">5. Contact Us</h2>
                <p>
                  If you have any questions or concerns about our Privacy Policy or Terms of Service, please reach out to our admin team at:
                  <br />
                  <span className="font-medium text-rose-600">devrangers@gmail.com</span>
                </p>
              </section>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  );
}
