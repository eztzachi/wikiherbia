/*
 * Copyright 2015 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package data;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.ArrayList;

/**
 * @author Tzachi
 */
@Component
public class DatabaseLoader implements CommandLineRunner {

	private final HerbRepository herbRepo;
	private final HerbCategoryQuestionRepository questionRepository;

	@Autowired
	public DatabaseLoader(HerbRepository herbRepo, HerbCategoryQuestionRepository questionRepository) {
		this.herbRepo = herbRepo;
		this.questionRepository = questionRepository;
	}

	@Override
	public void run(String... strings) throws Exception {
		Herb herb1 = new Herb("Frodo", HerbCategory.PURGE_FIRE ,"it can kill you");
		Herb herb2 = new Herb("Bilbo", HerbCategory.PURGE_FIRE,"it can cure you");
		Herb herb3 = new Herb("Pippin", HerbCategory.RESOLVE_TOXICITY,"it does something");
		this.herbRepo.save(herb1);
		this.herbRepo.save(herb2);
		this.herbRepo.save(herb3);


		this.questionRepository.save(new HerbCategoryQuestion( new ArrayList<HerbCategory>() {{
			add(HerbCategory.PURGE_FIRE);
			add(HerbCategory.RESOLVE_TOXICITY);
			add(HerbCategory.SNOW_STORM);
		}}, herb1));
		this.questionRepository.save(new HerbCategoryQuestion(new ArrayList<HerbCategory>() {{
			add(HerbCategory.PURGE_FIRE);
			add(HerbCategory.RESOLVE_TOXICITY);
			add(HerbCategory.SNOW_STORM);
		}}, herb2));
		this.questionRepository.save(new HerbCategoryQuestion(new ArrayList<HerbCategory>() {{
			add(HerbCategory.PURGE_FIRE);
			add(HerbCategory.RESOLVE_TOXICITY);
			add(HerbCategory.SNOW_STORM);
		}}, herb3));

	}
}